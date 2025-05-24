using System.Collections.Concurrent;
using System.Text.Json;
using the_enigma_casino_server.Application.Services;
using the_enigma_casino_server.Application.Services.Friendship;
using the_enigma_casino_server.Core.Entities.Enum;
using the_enigma_casino_server.Games.Shared.Entities;
using the_enigma_casino_server.Games.Shared.Enum;
using the_enigma_casino_server.WebSockets.Base;
using the_enigma_casino_server.WebSockets.Interfaces;

namespace the_enigma_casino_server.WebSockets.Friends;

public class FriendsWS : BaseWebSocketHandler, IWebSocketMessageHandler
{
    public string Type => "friend";
    private static readonly ConcurrentDictionary<int, (int inviterId, int tableId, DateTime expiresAt)> _pendingInvitations = new();
    private static readonly TimeSpan InvitationTimeout = TimeSpan.FromSeconds(20);


    public FriendsWS(ConnectionManagerWS connectionManager, IServiceProvider serviceProvider)
        : base(connectionManager, serviceProvider)
    {
        connectionManager.OnUserConnected += HandleUserStatusChanged;
        connectionManager.OnUserDisconnected += HandleUserStatusChanged;
        connectionManager.OnUserStatusChanged += HandleUserStatusChanged;
    }



    public async Task HandleAsync(string userIdStr, JsonElement message)
    {
        if (!int.TryParse(userIdStr, out int userId))
            return;

        if (!message.TryGetProperty("action", out var actionProp))
            return;

        string action = actionProp.GetString();

        await (action switch
        {
            FriendsMessageType.Send => HandleSendAsync(userId, message),
            FriendsMessageType.Accept => HandleAcceptAsync(userId, message),
            FriendsMessageType.Cancel => HandleCancelAsync(userId, message),
            FriendsMessageType.Remove => HandleRemoveAsync(userId, message),
            FriendsMessageType.GetOnlineFriends => HandleGetOnlineFriendsAsync(userId),
            FriendsMessageType.InviteFromTable => HandleInviteFromTableAsync(userId, message), // Invitacion individual dentro de mesa
            FriendsMessageType.InviteFromFriendsList => HandleInviteFromFriendsListAsync(userId, message), // Invitacion para ambos
            FriendsMessageType.AcceptGameInvite => HandleAcceptGameInviteAsync(userId, message),  // Acepta ambos
            FriendsMessageType.AcceptTableInvite => HandleAcceptTableInviteAsync(userId, message), // Acepta individualmente
            FriendsMessageType.RejectGameInvite => HandleRejectGameInviteAsync(userId, message),
            _ => Task.CompletedTask
        });
    }

    private async Task HandleSendAsync(int senderId, JsonElement message)
    {
        if (!message.TryGetProperty("receiverId", out var receiverProp))
            return;

        int receiverId = receiverProp.GetInt32();

        FriendRequestService friendRequestService = GetScopedService<FriendRequestService>(out var scope);
        using (scope)
        {
            try
            {
                await friendRequestService.SendFriendRequestAsync(senderId, receiverId);
                var senderUser = await GetUserById(senderId);

                // Notifica si esta conectado
                if (_connectionManager.IsUserConnected(receiverId.ToString()))
                {
                    Console.WriteLine($"[WS] Enviando WS a {receiverId} desde {senderId}");
                    await ((IWebSocketSender)this).SendToUserAsync(receiverId.ToString(), new
                    {
                        type = Type,
                        action = FriendsMessageType.FriendRequestReceived,
                        senderId = senderUser.Id,
                        nickname = senderUser.NickName,
                        image = senderUser.Image
                    });
                }
                else
                {
                    Console.WriteLine($"[WS] Usuario {receiverId} está offline. No se envía nada.");
                }

                await ((IWebSocketSender)this).SendToUserAsync(senderId.ToString(), new
                {
                    type = Type,
                    action = FriendsMessageType.RequestSent,
                    receiverId
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[FriendWS] Error al enviar solicitud: {ex.Message}");
                await SendErrorAsync(senderId.ToString(), "No se pudo enviar la solicitud.", Type);
            }
        }
    }

    private async Task HandleAcceptAsync(int receiverId, JsonElement message)
    {
        if (!message.TryGetProperty("senderId", out var senderProp))
            return;

        int senderId = senderProp.GetInt32();

        FriendRequestService friendRequestService = GetScopedService<FriendRequestService>(out var scope);
        using (scope)
        {
            try
            {
                await friendRequestService.AcceptFriendRequestAsync(senderId, receiverId);
                var receiverUser = await GetUserById(receiverId);

                await ((IWebSocketSender)this).SendToUserAsync(senderId.ToString(), new
                {
                    type = Type,
                    action = FriendsMessageType.FriendRequestAccepted,
                    friendId = receiverUser.Id,
                    nickname = receiverUser.NickName,
                    image = receiverUser.Image
                });

                await ((IWebSocketSender)this).SendToUserAsync(receiverId.ToString(), new
                {
                    type = Type,
                    action = FriendsMessageType.RequestAccepted,
                    friendId = senderId
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[FriendWS] Error al aceptar solicitud: {ex.Message}");
                await SendErrorAsync(receiverId.ToString(), "No se pudo aceptar la solicitud.", Type);
            }
        }
    }

    private async Task HandleCancelAsync(int senderId, JsonElement message)
    {
        if (!message.TryGetProperty("receiverId", out var receiverProp))
            return;

        int receiverId = receiverProp.GetInt32();

        FriendRequestService friendRequestService = GetScopedService<FriendRequestService>(out var scope);
        using (scope)
        {
            try
            {
                await friendRequestService.CancelFriendRequestAsync(senderId, receiverId);

                await ((IWebSocketSender)this).SendToUserAsync(receiverId.ToString(), new
                {
                    type = Type,
                    action = FriendsMessageType.FriendRequestCanceled,
                    senderId
                });

                await ((IWebSocketSender)this).SendToUserAsync(senderId.ToString(), new
                {
                    type = Type,
                    action = FriendsMessageType.RequestCanceled,
                    receiverId
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[FriendWS] Error al cancelar solicitud: {ex.Message}");
                await SendErrorAsync(senderId.ToString(), "No se pudo cancelar la solicitud.", Type);
            }
        }
    }

    private async Task HandleRemoveAsync(int userId, JsonElement message)
    {
        if (!message.TryGetProperty("friendId", out var friendProp))
            return;

        int friendId = friendProp.GetInt32();

        UserFriendService userFriendService = GetScopedService<UserFriendService>(out var scope);
        using (scope)
        {
            try
            {
                await userFriendService.RemoveFriendAsync(userId, friendId);

                var payload = new
                {
                    type = Type,
                    action = FriendsMessageType.FriendRemoved,
                    removedBy = userId
                };

                await ((IWebSocketSender)this).SendToUserAsync(friendId.ToString(), payload);
                await ((IWebSocketSender)this).SendToUserAsync(userId.ToString(), payload);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[FriendWS] Error al eliminar amistad: {ex.Message}");
                await SendErrorAsync(userId.ToString(), "No se pudo eliminar la amistad.", Type);
            }
        }
    }

    private async Task HandleGetOnlineFriendsAsync(int userId)
    {
        IServiceScope scope;
        var userFriendService = GetScopedService<UserFriendService>(out scope);
        using (scope)
        {
            var connectedUserIds = _connectionManager.GetAllConnectedUserIds();

            var onlineFriends = await userFriendService.GetOnlineFriendsAsync(userId, connectedUserIds);

            await ((IWebSocketSender)this).SendToUserAsync(userId.ToString(), new
            {
                type = Type,
                action = FriendsMessageType.OnlineFriends,
                friends = onlineFriends.Select(f => new
                {
                    id = f.Id,
                    nickname = f.NickName,
                    image = f.Image,
                    status = UserStatusStore.GetStatus(f.Id).ToString()
                }).ToList()
            });
        }
    }

    private async void HandleUserStatusChanged(string userIdStr)
    {
        if (!int.TryParse(userIdStr, out int userId))
            return;

        IServiceScope scope;
        UserFriendService userFriendService = GetScopedService<UserFriendService>(out scope);
        using (scope)
        {
            var friendIds = await userFriendService.GetFriendIdsAsync(userId);

            foreach (var friendId in friendIds)
            {
                if (_connectionManager.IsUserConnected(friendId.ToString()))
                {
                    await HandleGetOnlineFriendsAsync(friendId);
                }
            }
            await HandleGetOnlineFriendsAsync(userId);
        }
    }

    // Invitacion desde mesa
    private async Task HandleInviteFromTableAsync(int inviterId, JsonElement message)
    {
        if (!message.TryGetProperty("friendId", out var friendIdProp) ||
            !message.TryGetProperty("tableId", out var tableIdProp))
            return;

        int friendId = friendIdProp.GetInt32();
        int tableId = tableIdProp.GetInt32();

        var friendStatus = UserStatusStore.GetStatus(friendId);
        if (friendStatus == UserStatus.Playing)
        {
            await SendErrorAsync(inviterId.ToString(), "Tu amigo ya está jugando.", Type);
            return;
        }

        if (_pendingInvitations.ContainsKey(friendId))
        {
            await SendErrorAsync(inviterId.ToString(), "Ya has enviado una invitación a este amigo.", Type);
            return;
        }

        _pendingInvitations[friendId] = (inviterId, tableId, DateTime.UtcNow.Add(InvitationTimeout));
        var inviterUser = await GetUserById(inviterId);

        await ((IWebSocketSender)this).SendToUserAsync(friendId.ToString(), new
        {
            type = Type,
            action = FriendsMessageType.FriendInvitedToGame,
            inviterId = inviterUser.Id,
            nickname = inviterUser.NickName,
            image = inviterUser.Image,
            tableId = tableId.ToString(),
            expiresIn = (int)InvitationTimeout.TotalSeconds
        });

        _ = Task.Run(async () =>
        {
            await Task.Delay(InvitationTimeout);
            if (_pendingInvitations.TryRemove(friendId, out var info) &&
                info.expiresAt <= DateTime.UtcNow)
            {
                await ((IWebSocketSender)this).SendToUserAsync(info.inviterId.ToString(), new
                {
                    type = Type,
                    action = "inviteExpired",
                    friendId = friendId
                });

                await ((IWebSocketSender)this).SendToUserAsync(friendId.ToString(), new
                {
                    type = Type,
                    action = "inviteExpired",
                    inviterId = info.inviterId
                });
            }
        });
    }

    // Invitacion desde amigos
    private async Task HandleInviteFromFriendsListAsync(int inviterId, JsonElement message)
    {
        if (!message.TryGetProperty("friendId", out var friendIdProp) ||
            !message.TryGetProperty("gameType", out var gameTypeProp))
            return;

        int friendId = friendIdProp.GetInt32();
        var friendStatus = UserStatusStore.GetStatus(friendId);
        if (friendStatus == UserStatus.Playing)
        {
            await SendErrorAsync(inviterId.ToString(), "Tu amigo ya está jugando.", Type);
            return;
        }


        if (!Enum.TryParse<GameType>(gameTypeProp.GetString(), out var gameType))
        {
            await SendErrorAsync(inviterId.ToString(), "Tipo de juego inválido.", Type);
            return;
        }

        if (_pendingInvitations.ContainsKey(friendId))
        {
            await SendErrorAsync(inviterId.ToString(), "Ya has enviado una invitación a este amigo.", Type);
            return;
        }

        using var scope = _serviceProvider.CreateScope();
        TableService tableService = scope.ServiceProvider.GetRequiredService<TableService>();
        var availableTables = await tableService.GetAvailableTablesByTypeAsync(gameType);

        Table table = availableTables
            .Where(t => t.Players.Count <= t.MaxPlayer - 2)
            .OrderBy(t => t.Players.Count)
            .FirstOrDefault();

        if (table == null)
        {
            await SendErrorAsync(inviterId.ToString(), "No hay mesas disponibles con espacio suficiente.", Type);
            return;
        }

        int tableId = table.Id;

        if (!_connectionManager.IsUserConnected(friendId.ToString()))
        {
            Console.WriteLine($"[Invite] Usuario {friendId} no está conectado, no se envió la invitación.");
            return;
        }

        _pendingInvitations[friendId] = (inviterId, tableId, DateTime.UtcNow.Add(InvitationTimeout));
        var inviterUser = await GetUserById(inviterId);

        await ((IWebSocketSender)this).SendToUserAsync(friendId.ToString(), new
        {
            type = Type,
            action = FriendsMessageType.FriendInvitedToGame,
            inviterId = inviterUser.Id,
            nickname = inviterUser.NickName,
            image = inviterUser.Image,
            tableId = tableId,
            expiresIn = (int)InvitationTimeout.TotalSeconds
        });

        _ = Task.Run(async () =>
        {
            await Task.Delay(InvitationTimeout);
            if (_pendingInvitations.TryRemove(friendId, out var info) &&
                info.expiresAt <= DateTime.UtcNow)
            {
                await ((IWebSocketSender)this).SendToUserAsync(info.inviterId.ToString(), new
                {
                    type = Type,
                    action = "inviteExpired",
                    friendId = friendId
                });

                await ((IWebSocketSender)this).SendToUserAsync(friendId.ToString(), new
                {
                    type = Type,
                    action = "inviteExpired",
                    inviterId = info.inviterId
                });
            }
        });
    }


    private async Task HandleAcceptGameInviteAsync(int userId, JsonElement message)
    {
        if (!message.TryGetProperty("inviterId", out var inviterIdProp) ||
            !message.TryGetProperty("tableId", out var tableIdProp))
            return;

        int inviterId = inviterIdProp.GetInt32();
        int tableId = tableIdProp.GetInt32();

        if (!_pendingInvitations.TryGetValue(userId, out var info) || info.expiresAt <= DateTime.UtcNow)
        {
            await SendErrorAsync(userId.ToString(), "La invitación ha expirado.", Type);
            return;
        }

        _pendingInvitations.TryRemove(userId, out _);


        await ((IWebSocketSender)this).SendToUserAsync(inviterId.ToString(), new
        {
            type = Type,
            action = FriendsMessageType.GameInviteAccepted,
            friendId = userId,
            tableId = tableId.ToString()
        });

        foreach (int id in new[] { userId, inviterId })
        {
            await ((IWebSocketSender)this).SendToUserAsync(id.ToString(), new
            {
                type = "game_table",
                action = "join_table",
                tableId = tableId.ToString()
            });
        }
    }
    
    private async Task HandleRejectGameInviteAsync(int userId, JsonElement message)
    {
        if (!message.TryGetProperty("inviterId", out var inviterIdProp))
            return;

        int inviterId = inviterIdProp.GetInt32();

        _pendingInvitations.TryRemove(userId, out _);

        var rejectingUser = await GetUserById(userId);

        await ((IWebSocketSender)this).SendToUserAsync(inviterId.ToString(), new
        {
            type = Type,
            action = FriendsMessageType.GameInviteRejected,
            friendId = userId,
            nickname = rejectingUser.NickName,
        });
    }

    private async Task HandleAcceptTableInviteAsync(int userId, JsonElement message)
    {
        if (!message.TryGetProperty("inviterId", out var inviterIdProp) ||
            !message.TryGetProperty("tableId", out var tableIdProp))
            return;

        int inviterId = inviterIdProp.GetInt32();
        int tableId = tableIdProp.GetInt32();


        using var scope = _serviceProvider.CreateScope();
        var tableService = scope.ServiceProvider.GetRequiredService<TableService>();
        var table = await tableService.GetTableByIdAsync(tableId);

        var inviterNickname = await GetUserById(userId);

        if (table == null)
        {
            await SendErrorAsync(userId.ToString(), "La mesa ya no existe.", Type);
            return;
        }

        if (table.Players.Count >= table.MaxPlayer)
        {
            await SendErrorAsync(userId.ToString(), "La mesa está llena.", Type);
            return;
        }

        await ((IWebSocketSender)this).SendToUserAsync(userId.ToString(), new
        {
            type = "game_table",
            action = "join_table",
            tableId = tableId.ToString()
        });


        await ((IWebSocketSender)this).SendToUserAsync(inviterId.ToString(), new
        {
            type = Type,
            action = FriendsMessageType.GameInviteAccepted,
            friendId = userId,
            tableId = tableId.ToString(),
            nickName = inviterNickname.NickName
        });
    }
}
