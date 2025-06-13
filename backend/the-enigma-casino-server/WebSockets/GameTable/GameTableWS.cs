
using System.Collections.Concurrent;
using System.Text.Json;
using the_enigma_casino_server.Application.Services;
using the_enigma_casino_server.Core.Entities.Enum;
using the_enigma_casino_server.Games.Shared.Entities;
using the_enigma_casino_server.Games.Shared.Enum;
using the_enigma_casino_server.Infrastructure.Database;
using the_enigma_casino_server.Websockets.Roulette;
using the_enigma_casino_server.WebSockets.Base;
using the_enigma_casino_server.WebSockets.GameMatch;
using the_enigma_casino_server.WebSockets.GameMatch.Store;
using the_enigma_casino_server.WebSockets.GameTable.Models;
using the_enigma_casino_server.WebSockets.GameTable.Store;
using the_enigma_casino_server.WebSockets.Interfaces;
using the_enigma_casino_server.WebSockets.Resolvers;

namespace the_enigma_casino_server.WebSockets.GameTable;

public class GameTableWS : BaseWebSocketHandler, IWebSocketMessageHandler
{
    public string Type => "game_table";

    private readonly GameMatchWS _gameMatchWS;

    private static readonly ConcurrentDictionary<int, SemaphoreSlim> _tableLocks = new();


    public GameTableWS(
        ConnectionManagerWS connectionManager,
        IServiceProvider serviceProvider,
        GameMatchWS gameMatchWS,
        UserDisconnectionHandler disconnectionHandler)
        : base(connectionManager, serviceProvider)
    {
        _gameMatchWS = gameMatchWS;
        connectionManager.OnUserDisconnected += async userId =>
        {
            using var scope = serviceProvider.CreateScope();
            var handler = scope.ServiceProvider.GetRequiredService<UserDisconnectionHandler>();
            await handler.HandleDisconnectionAsync(userId);
        };
    }


    private GameTableManager GetScopedTableManager(IServiceScope scope)
    {
        return scope.ServiceProvider.GetRequiredService<GameTableManager>();
    }

    public async Task HandleAsync(string userId, JsonElement message)
    {
        if (message.TryGetProperty("action", out JsonElement actionProp))
        {
            string action = actionProp.GetString();
            await (action switch
            {
                GameTableMessageTypes.JoinTable => HandleJoinTableAsync(userId, message),
                GameTableMessageTypes.LeaveTable => HandleLeaveTableAsync(userId, message),
                GameTableMessageTypes.GetAllPlayers => HandleGetAllPlayersAsync(userId),
                _ => Task.CompletedTask
            });
        }
    }


    private async Task HandleJoinTableAsync(string userId, JsonElement message)
    {
        if (!message.TryGetProperty("tableId", out JsonElement tableIdProp) ||
            !int.TryParse(tableIdProp.GetString(), out int tableId) ||
            !int.TryParse(userId, out int userIdInt))
            return;

        if (IsUserBusyInAnotherTable(userIdInt))
        {
            if (!IsAlreadyInTargetTable(userIdInt, tableId))
            {
                await ((IWebSocketSender)this).SendToUserAsync(userId, new
                {
                    type = Type,
                    action = "error",
                    message = "No puedes unirte a otra mesa mientras participas en una partida activa."
                });
                return;
            }
        }


        IServiceScope scope;
        UnitOfWork unitOfWork = GetScopedService<UnitOfWork>(out scope);
        using (scope)
        {
            var user = await unitOfWork.UserRepository.GetByIdAsync(userIdInt);
            if (user == null) return;
            

            var tableManager = GetScopedTableManager(scope);
            if (!tableManager.CanJoinTable(user.Id))
            {
                await ((IWebSocketSender)this).SendToUserAsync(userId, new
                {
                    type = "game_table",
                    action = "join_denied",
                    reason = "Hace poco que has salido de la mesa, no te puedes volver a unir."
                });
                return;
            }

            var session = await GetOrLoadTableAsync(tableId);
            if (session == null) return;

            var table = session.Table;

            var joinGuard = scope.ServiceProvider.GetRequiredService<GameTableJoinGuard>();
            if (!joinGuard.CanJoin(table, user, out string reason))
            {
                await ((IWebSocketSender)this).SendToUserAsync(userId, new
                {
                    type = "game_table",
                    action = "join_denied",
                    reason
                });
                return;
            }

            var semaphore = _tableLocks.GetOrAdd(tableId, _ => new SemaphoreSlim(1, 1));
            await semaphore.WaitAsync();
            try
            {
                var result = tableManager.TryAddPlayer(table, user);
                if (!result.Success)
                {
                    string action = result.ErrorCode == "maintenance" ? "table_closed" : "join_denied";

                    await ((IWebSocketSender)this).SendToUserAsync(userId, new
                    {
                        type = "game_table",
                        action,
                        reason = result.ErrorCode,
                        message = result.ErrorMessage
                    });
                    return;
                }
                user.Status = UserStatus.Playing;
                UserStatusStore.SetStatus(user.Id, UserStatus.Playing);// Status playin
                _connectionManager.RaiseUserStatusChanged(userId.ToString());

            }
            finally
            {
                semaphore.Release();
            }

            await ((IWebSocketSender)this).BroadcastToUsersAsync(
             session.GetConnectedUserIds(),
             new
             {
                 type = Type,
                 action = GameTableMessageTypes.TableUpdate,
                 tableId = table.Id,
                 players = GetPlayerInfos(table),
                 state = table.TableState.ToString()
             });


            if (table.TableState == TableState.InProgress)
            {
                await ((IWebSocketSender)this).SendToUserAsync(userId, new
                {
                    type = "game_match",
                    action = GameTableMessageTypes.WaitingNextMatch,
                    tableId = table.Id,
                    message = "Una partida está en curso. Te unirás automáticamente a la siguiente ronda."
                });
            }

            using var gameScope = _serviceProvider.CreateScope();
            var joinHelper = gameScope.ServiceProvider
                .GetRequiredService<GameJoinHelperResolver>()
                .Resolve(table.GameType);

            if (joinHelper != null)
            {
                await joinHelper.NotifyPlayerCanJoinCurrentMatchIfPossible(userIdInt, table, this);
            }

            if (table.Players.Count >= table.MinPlayer &&
                table.TableState == TableState.Waiting &&
                !HasActiveMatch(table.Id))
            {

                session.StartOrRestartCountdown();
                table.TableState = TableState.Starting;

                unitOfWork.GameTableRepository.Update(table);
                await unitOfWork.SaveAsync();

                await ((IWebSocketSender)this).BroadcastToUsersAsync(
                    session.GetConnectedUserIds(),
                    new
                    {
                        type = Type,
                        action = GameTableMessageTypes.CountdownStarted,
                        tableId = table.Id,
                        countdown = 30
                    });
            }
            else
            {
                if (table.GameType == GameType.Poker &&
                    table.TableState == TableState.Waiting &&
                    table.Players.Count(p => p.PlayerState == PlayerState.Waiting && !p.HasAbandoned) == 1)
                {
                    var waitingPlayer = table.Players.First(p => p.PlayerState == PlayerState.Waiting && !p.HasAbandoned);

                    await ((IWebSocketSender)this).SendToUserAsync(waitingPlayer.UserId.ToString(), new
                    {
                        type = "game_table",
                        action = "waiting_opponent",
                        tableId = table.Id,
                        message = "Estás solo en la mesa. Esperando un oponente..."
                    });
                }
            }

        }
    }


    private async Task<ActiveGameSession> GetOrLoadTableAsync(int tableId)
    {
        if (ActiveGameSessionStore.TryGet(tableId, out ActiveGameSession existingSession))
            return existingSession;

        IServiceScope scope;
        TableService tableService = GetScopedService<TableService>(out scope);
        using (scope)
        {
            Table table = await tableService.GetTableByIdAsync(tableId);
            if (table != null)
            {

                ActiveGameSession newSession = new ActiveGameSession(
                    table,
                    OnStartMatchTimerFinished
                );

                ActiveGameSessionStore.Set(tableId, newSession);

                return newSession;
            }

            return null;
        }
    }


    private async void OnStartMatchTimerFinished(int tableId)
    {
        if (!ActiveGameSessionStore.TryGet(tableId, out ActiveGameSession session)) return;


        Table table = session.Table;
        bool shouldStart = false;
        List<string> userIds;

        lock (table)
        {
            if (table.TableState != TableState.Waiting && table.TableState != TableState.Starting) return;
            

            shouldStart = true;
            userIds = table.Players.Select(p => p.UserId.ToString()).ToList();
        }

        if (shouldStart)
        {
            await ((IWebSocketSender)this).BroadcastToUsersAsync(userIds, new
            {
                type = Type,
                action = GameTableMessageTypes.GameStart,
                tableId = table.Id
            });

            await _gameMatchWS.StartMatchForTableAsync(tableId);
        }
    }


    private async Task HandleLeaveTableAsync(string userIdStr, JsonElement message)
    {
        if (!int.TryParse(userIdStr, out int userId))
            return;

        if (!message.TryGetProperty("tableId", out var tableIdProp) ||
            !int.TryParse(tableIdProp.GetString(), out int tableId)) return;
        

        using var scope = _serviceProvider.CreateScope();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<UnitOfWork>();
        var tableManager = scope.ServiceProvider.GetRequiredService<GameTableManager>();

        if (!ActiveGameSessionStore.TryGet(tableId, out var session)) return;
        

        var table = session.Table;
        var player = table.Players.FirstOrDefault(p => p.UserId == userId);

        if (player == null) return;
        

        if (player.GameMatch != null && player.GameMatch.MatchState == MatchState.InProgress)
        {
            var matchWS = scope.ServiceProvider.GetRequiredService<GameMatchWS>();
            await matchWS.ProcessPlayerMatchLeaveAsync(tableId, userId);

            UserStatusStore.SetStatus(userId, UserStatus.Online);
            _connectionManager.RaiseUserStatusChanged(userId.ToString());
            return;
        }


        tableManager.RegisterJoinAttempt(userId);
        PlayerLeaveResult result = tableManager.RemovePlayerFromTable(table, userId, out var removedPlayer);

        if (result.PlayerRemoved)
        {
            var history = await unitOfWork.GameHistoryRepository.FindActiveSessionAsync(userId, tableId);
            if (history != null && history.LeftAt == null)
            {
                history.LeftAt = DateTime.Now;
                unitOfWork.GameHistoryRepository.Update(history);
                await unitOfWork.SaveAsync();
            }

            await ((IWebSocketSender)this).BroadcastToUsersAsync(result.ConnectedUsers, new
            {
                type = "game_table",
                action = GameTableMessageTypes.TableUpdate,
                tableId,
                players = GetPlayerInfos(table),
                state = result.State.ToString()
            });

            if (result.StopCountdown)
            {
                session.CancelCountdown();
                await ((IWebSocketSender)this).BroadcastToUsersAsync(result.ConnectedUsers, new
                {
                    type = "game_table",
                    action = GameTableMessageTypes.CountdownStopped,
                    tableId
                });
            }

            unitOfWork.GameTableRepository.Update(table);
            await unitOfWork.SaveAsync();

            if (table.Players.All(p => p.PlayerState == PlayerState.Left || p.HasAbandoned))
            {
                table.TableState = TableState.Waiting;
                unitOfWork.GameTableRepository.Update(table);
                await unitOfWork.SaveAsync();

                ActiveGameSessionStore.Remove(tableId);
            }

            await ((IWebSocketSender)this).SendToUserAsync(userIdStr, new
            {
                type = "game_table",
                action = "leave_success",
                userId
            });

            UserStatusStore.SetStatus(userId, UserStatus.Online);
            _connectionManager.RaiseUserStatusChanged(userIdStr);

            await TryPromoteSpectatorsAndStartMatchAsync(tableId);
        }
        else
        {
            Console.WriteLine($"⚠️ [LeaveTable] No se eliminó a {player.User.NickName} porque no cumplía condiciones.");
        }
    }

    private async Task HandleGetAllPlayersAsync(string userId)
    {
        var players = GetAllActivePlayers();

        var response = players.Select(p => new
        {
            tableId = p.TableId,
            userId = p.UserId,
            nickName = p.NickName,
            image = p.Image
        });

        await ((IWebSocketSender)this).SendToUserAsync(userId, new
        {
            type = "game_table",
            action = "all_players_list",
            players = response
        });
    }




    public bool IsUserBusyInAnotherTable(int userId)
    {
        foreach (var session in ActiveGameSessionStore.GetAll().Values)
        {
            var table = session.Table;
            var player = table.Players.FirstOrDefault(p => p.UserId == userId);

            if (player != null)
            {
                bool allowedBecauseFold = (player.PlayerState == PlayerState.Fold && player.HasAbandoned);
                bool allowedBecauseLeft = player.PlayerState == PlayerState.Left;
                bool allowedBecauseWaitingTable = table.TableState == TableState.Waiting;

                if (allowedBecauseFold || allowedBecauseLeft || allowedBecauseWaitingTable) continue;

                return true;
            }
        }
        return false;
    }



    public PlayerLeaveResult? ForceRemovePlayerFromTable(int userId, ActiveGameSession session)
    {
        var table = session.Table;

        IServiceScope scope;
        GameTableManager tableManager = GetScopedService<GameTableManager>(out scope);
        using (scope)
        {
            lock (table)
            {
                var result = tableManager.ProcessPlayerLeaving(table, session, userId);
                return result.PlayerRemoved ? result : null;
            }
        }
    }


    public Task BroadcastTableUpdateAsync(Table table, IEnumerable<string> userIds, string[] playerNames)
    {
        return ((IWebSocketSender)this).BroadcastToUsersAsync(userIds, new
        {
            type = Type,
            action = GameTableMessageTypes.TableUpdate,
            tableId = table.Id,
            players = playerNames,
            state = table.TableState.ToString()
        });
    }

    public Task BroadcastCountdownStoppedAsync(int tableId, IEnumerable<string> userIds)
    {
        return ((IWebSocketSender)this).BroadcastToUsersAsync(userIds, new
        {
            type = Type,
            action = GameTableMessageTypes.CountdownStopped,
            tableId
        });
    }

    private bool HasActiveMatch(int tableId)
    {
        return ActiveGameMatchStore.TryGet(tableId, out Match match)
               && match.MatchState == MatchState.InProgress;
    }

    public async Task<bool> TryPromoteSpectatorsAndStartMatchAsync(int tableId)
    {

        if (!ActiveGameSessionStore.TryGet(tableId, out var session)) return false;
        

        var table = session.Table;

        bool allRealPlayersGone = table.Players.All(p =>
             p.PlayerState != PlayerState.Playing && p.PlayerState != PlayerState.Waiting);


        var spectators = table.Players.Where(p => p.PlayerState == PlayerState.Spectating).ToList();

        if (!allRealPlayersGone || spectators.Count == 0)
            return false;

        foreach (var spectator in spectators)
        {
            spectator.PlayerState = PlayerState.Waiting;
            spectator.HasAbandoned = false;
        }

        using var scope = _serviceProvider.CreateScope();
        var uow = scope.ServiceProvider.GetRequiredService<UnitOfWork>();
        uow.GameTableRepository.Update(table);
        await uow.SaveAsync();

        var gameTableWS = scope.ServiceProvider.GetRequiredService<GameTableWS>();
        await gameTableWS.BroadcastTableUpdateAsync(
            table,
            session.GetConnectedUserIds(),
            session.GetPlayerNames().ToArray());

        int activePlayers = table.Players.Count(p => p.PlayerState == PlayerState.Waiting);

        if (activePlayers >= table.MinPlayer)
        {
            table.TableState = TableState.Starting;
            uow.GameTableRepository.Update(table);
            await uow.SaveAsync();

            var matchWS = scope.ServiceProvider.GetRequiredService<GameMatchWS>();

            var tblMgr = scope.ServiceProvider.GetRequiredService<GameTableManager>();
            var playersToRemove = table.Players
                .Where(p => p.PlayerState == PlayerState.Left || p.HasAbandoned)
                .ToList();

            foreach (var p in playersToRemove)
            {
                tblMgr.RemovePlayerFromTable(table, p.UserId, out _);
            }

            if (table.GameType == GameType.Roulette)
            {
                var rouletteWS = scope.ServiceProvider.GetRequiredService<RouletteWS>();
                await rouletteWS.RestartRoundForSpectatorsAsync(table.Id);
            }
            else
            {
                await matchWS.StartMatchForTableAsync(table.Id);
            }

            foreach (var promoted in spectators)
            {
                string actionType = table.GameType switch
                {
                    GameType.BlackJack => "blackjack",
                    GameType.Poker => "poker",
                    GameType.Roulette => "roulette",
                    _ => "game_match"
                };

                await ((IWebSocketSender)this).SendToUserAsync(promoted.UserId.ToString(), new
                {
                    type = actionType,
                    action = "match_ready",
                    tableId,
                    message = "¡Estás dentro de la próxima partida! Prepárate para jugar 🎲"
                });
            }

            return true;
        }

        if (table.GameType == GameType.Poker)
        {
            foreach (var userId in session.GetConnectedUserIds())
            {
                await ((IWebSocketSender)this).SendToUserAsync(userId, new
                {
                    type = "game_table",
                    action = "waiting_opponent",
                    tableId = table.Id,
                    message = "Estás listo para jugar, pero necesitas al menos un oponente. Esperando más jugadores..."
                });
            }
        }

        return false;
    }
    private bool IsAlreadyInTargetTable(int userId, int tableId)
    {
        if (ActiveGameSessionStore.TryGet(tableId, out var session))
        {
            return session.Table.Players.Any(p =>
                p.UserId == userId &&
                p.PlayerState != PlayerState.Left &&
                p.PlayerState != PlayerState.Spectating);
        }

        return false;
    }


    public List<(int TableId, int UserId, string NickName, string Image)> GetAllActivePlayers()
    {
        var result = new List<(int, int, string, string)>();

        foreach (var session in ActiveGameSessionStore.GetAll().Values)
        {
            var tableId = session.Table.Id;

            foreach (var player in session.Table.Players)
            {
                if (player.User != null &&
                    player.PlayerState != PlayerState.Left &&
                    !player.HasAbandoned)
                {
                    result.Add((tableId, player.User.Id, player.User.NickName, player.User.Image));
                }
            }
        }

        return result;
    }

    private List<object> GetPlayerInfos(Table table)
    {
        return table.Players
            .Where(p => p.User != null && p.PlayerState != PlayerState.Left && !p.HasAbandoned)
            .Select(p => new
            {
                userId = p.User.Id,
                nickName = p.User.NickName,
                image = string.IsNullOrWhiteSpace(p.User.Image) ? "user_default.webp" : p.User.Image
            }).Cast<object>().ToList(); // cast para evitar error de tipo dinámico
    }


}