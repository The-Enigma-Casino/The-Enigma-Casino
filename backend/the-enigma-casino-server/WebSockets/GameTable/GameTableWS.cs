
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
            await ((IWebSocketSender)this).SendToUserAsync(userId, new
            {
                type = Type,
                action = "error",
                message = "No puedes unirte a otra mesa mientras participas en una partida activa."
            });
            return;
        }

        IServiceScope scope;
        UnitOfWork unitOfWork = GetScopedService<UnitOfWork>(out scope);
        using (scope)
        {
            var user = await unitOfWork.UserRepository.GetByIdAsync(userIdInt);
            if (user == null)
            {
                Console.WriteLine($"[GameTableWS] Usuario con ID {userIdInt} no encontrado.");
                return;
            }

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
            if (session == null)
            {
                Console.WriteLine($"[ERROR] No se pudo obtener sesión para mesa {tableId}");
                return;
            }

            var table = session.Table;

            var joinGuard = scope.ServiceProvider.GetRequiredService<GameTableJoinGuard>();
            if (!joinGuard.CanJoin(table, user, out string reason))
            {
                Console.WriteLine($"⛔ [JoinDenied] Usuario {user.NickName} no puede unirse a la mesa {tableId}. Motivo: {reason}");
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
                    Console.WriteLine($"❌ [JoinTable] No se pudo añadir a {user.NickName} a la mesa {table.Id}. Código: {result.ErrorCode}");

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
                    players = session.GetPlayerNames(),
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
                Console.WriteLine($"🔍 [HandleJoinTableAsync] Mesa {table.Id} cumple minPlayer. Estado actual: {table.TableState}");

                session.StartOrRestartCountdown();
                table.TableState = TableState.Starting;
                Console.WriteLine($"✅ Estado de mesa {table.Id} cambiado a: {table.TableState}");

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
                Console.WriteLine($"⏳ Mesa {table.Id} aún no cumple condiciones para 'Starting'. Jugadores: {table.Players.Count}/{table.MinPlayer}");
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
        if (!ActiveGameSessionStore.TryGet(tableId, out ActiveGameSession session))
        {
            Console.WriteLine($"[GameTableWS] No se encontró la sesión activa para la mesa {tableId}.");
            return;
        }

        Table table = session.Table;
        bool shouldStart = false;
        List<string> userIds;

        lock (table)
        {
            if (table.TableState != TableState.Waiting && table.TableState != TableState.Starting)
            {
                Console.WriteLine($"[GameTableWS] El estado de la mesa {tableId} ya no es 'Waiting' (es {table.TableState}).");
                return;
            }

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
            !int.TryParse(tableIdProp.GetString(), out int tableId))
        {
            Console.WriteLine("❌ [LeaveTable] tableId inválido.");
            return;
        }

        using var scope = _serviceProvider.CreateScope();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<UnitOfWork>();
        var tableManager = scope.ServiceProvider.GetRequiredService<GameTableManager>();

        if (!ActiveGameSessionStore.TryGet(tableId, out var session))
        {
            Console.WriteLine($"❌ [LeaveTable] No se encontró sesión activa para la mesa {tableId}");
            return;
        }

        var table = session.Table;
        var player = table.Players.FirstOrDefault(p => p.UserId == userId);

        if (player == null)
        {
            Console.WriteLine($"⚠️ [LeaveTable] Usuario {userId} no está en la mesa {tableId}");
            return;
        }

        if (player.GameMatch != null && player.GameMatch.MatchState == MatchState.InProgress)
        {
            Console.WriteLine($"🚪 [LeaveTable] {player.User.NickName} está en partida activa. Forzando salida del match...");

            var matchWS = scope.ServiceProvider.GetRequiredService<GameMatchWS>();
            await matchWS.ProcessPlayerMatchLeaveAsync(tableId, userId);

            UserStatusStore.SetStatus(userId, UserStatus.Online);
            _connectionManager.RaiseUserStatusChanged(userId.ToString());
            return;
        }

        if (player.GameMatch != null)
        {
            Console.WriteLine($"🔍 [LeaveTable] {player.User.NickName} sigue vinculado a un match con estado: {player.GameMatch.MatchState}");
        }
        else
        {
            Console.WriteLine($"🔍 [LeaveTable] {player.User.NickName} no está vinculado a ningún match.");
        }


        tableManager.RegisterJoinAttempt(userId);
        PlayerLeaveResult result = tableManager.RemovePlayerFromTable(table, userId, out var removedPlayer);

        if (result.PlayerRemoved)
        {
            Console.WriteLine($"✅ [LeaveTable] {removedPlayer.User.NickName} salió de la mesa {tableId}");

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
                players = result.PlayerNames,
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

            if (table.Players.All(p => p.PlayerState == PlayerState.Left))
            {
                table.TableState = TableState.Waiting;
                unitOfWork.GameTableRepository.Update(table);
                await unitOfWork.SaveAsync();

                ActiveGameSessionStore.Remove(tableId);
                Console.WriteLine($"🧹 [LeaveTable] Mesa {tableId} vacía. Sesión eliminada y estado persistido.");
            }

            await ((IWebSocketSender)this).SendToUserAsync(userIdStr, new
            {
                type = "game_table",
                action = "leave_success"
            });

            await TryPromoteSpectatorsAndStartMatchAsync(tableId);
        }
        else
        {
            Console.WriteLine($"⚠️ [LeaveTable] No se eliminó a {player.User.NickName} porque no cumplía condiciones.");
        }
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
        Console.WriteLine($"🧪 [Promoción] Evaluando promoción en mesa {tableId}");

        if (!ActiveGameSessionStore.TryGet(tableId, out var session))
        {
            Console.WriteLine($"❌ [Promoción] No se encontró sesión activa para mesa {tableId}");
            return false;
        }

        var table = session.Table;

        Console.WriteLine($"📋 [Promoción] Jugadores en la mesa {tableId}:");
        foreach (var p in table.Players)
        {
            Console.WriteLine($" - {p.User.NickName} | Estado: {p.PlayerState} | Abandonado: {p.HasAbandoned}");
        }


        bool allRealPlayersGone = table.Players.All(p =>
             p.PlayerState != PlayerState.Playing && p.PlayerState != PlayerState.Waiting);


        var spectators = table.Players.Where(p => p.PlayerState == PlayerState.Spectating).ToList();

        if (!allRealPlayersGone || spectators.Count == 0)
            return false;

        Console.WriteLine($"👥 [GameTableWS] Todos los jugadores se fueron, y hay {spectators.Count} espectadores. Promoviéndolos...");

        foreach (var spectator in spectators)
        {
            spectator.PlayerState = PlayerState.Waiting;
            spectator.HasAbandoned = false;
            Console.WriteLine($"👤 Promovido: {spectator.User.NickName}");
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
                Console.WriteLine($"🧹 [Promoción] Eliminado {p.User.NickName} de la mesa antes de iniciar partida.");
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
                    GameType.Roulette => "rulette",
                    _ => "game_match"
                };

                Console.WriteLine($"📨 [RouletteWS] Enviando match_ready a {promoted.User.NickName} en mesa {table.Id}");
                await ((IWebSocketSender)this).SendToUserAsync(promoted.UserId.ToString(), new
                {
                    type = actionType,
                    action = "match_ready",
                    tableId,
                    message = "¡Estás dentro de la próxima partida! Prepárate para jugar 🎲"
                });
            }

            Console.WriteLine($"🟢 [GameTableWS] Partida iniciada automáticamente tras promover espectadores en mesa {table.Id}.");
            return true;
        }

        if (table.GameType == GameType.Poker)
        {
            Console.WriteLine($"♠️ [GameTableWS] Jugador listo en mesa de Poker {table.Id} pero sin oponente. Enviando aviso...");

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
}