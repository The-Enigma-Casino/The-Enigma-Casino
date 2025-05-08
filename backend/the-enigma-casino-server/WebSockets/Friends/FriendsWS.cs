using System.Text.Json;
using the_enigma_casino_server.Application.Services.Friendship;
using the_enigma_casino_server.WebSockets.Base;
using the_enigma_casino_server.WebSockets.Interfaces;

namespace the_enigma_casino_server.WebSockets.Friends;

public class FriendsWS : BaseWebSocketHandler, IWebSocketMessageHandler
{
    public string Type => "friend";

    public FriendsWS(ConnectionManagerWS connectionManager, IServiceProvider serviceProvider)
        : base(connectionManager, serviceProvider)
    {
        connectionManager.OnUserConnected += HandleUserStatusChanged;
        connectionManager.OnUserDisconnected += HandleUserStatusChanged;
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
            FriendsMessageType.InviteFriendToGame => HandleInviteFriendToGameAsync(userId, message),
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

                await ((IWebSocketSender)this).SendToUserAsync(receiverId.ToString(), new
                {
                    type = Type,
                    action = FriendsMessageType.FriendRequestReceived,
                    senderId = senderUser.Id,
                    nickname = senderUser.NickName,
                    image = senderUser.Image
                });

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
                    image = f.Image
                }).ToList()
            });
        }
    }

    private async void HandleUserStatusChanged(string userIdStr)
    {
        if (!int.TryParse(userIdStr, out int userId))
            return;

        IServiceScope scope;
        var userFriendService = GetScopedService<UserFriendService>(out scope);
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
        }
    }

    private async Task HandleInviteFriendToGameAsync(int userId, JsonElement message)
    {
        if (!message.TryGetProperty("friendId", out var friendIdProp) ||
            !message.TryGetProperty("tableId", out var tableIdProp))
            return;

        int friendId = friendIdProp.GetInt32();
        int tableId = tableIdProp.GetInt32();

        var senderUser = await GetUserById(userId);

        await ((IWebSocketSender)this).SendToUserAsync(friendId.ToString(), new
        {
            type = Type,
            action = FriendsMessageType.FriendInvitedToGame,
            inviterId = senderUser.Id,
            nickname = senderUser.NickName,
            image = senderUser.Image,
            tableId = tableId
        });
    }
}
