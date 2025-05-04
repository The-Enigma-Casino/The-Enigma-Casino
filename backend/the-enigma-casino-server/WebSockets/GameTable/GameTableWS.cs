
using System.Collections.Concurrent;
using System.Text.Json;
using the_enigma_casino_server.Application.Services;
using the_enigma_casino_server.Core.Entities;
using the_enigma_casino_server.Games.Shared.Entities;
using the_enigma_casino_server.Games.Shared.Enum;
using the_enigma_casino_server.Infrastructure.Database;
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
            !int.TryParse(tableIdProp.GetString(), out int tableId))
            return;


        if (!int.TryParse(userId, out int userIdInt))
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
            User user = await unitOfWork.UserRepository.GetByIdAsync(userIdInt);
            if (user == null)
            {
                Console.WriteLine($"[GameTableWS] Usuario con ID {userIdInt} no encontrado.");
                return;
            }

            GameTableManager tableManager = GetScopedTableManager(scope);
            if (!tableManager.CanJoinTable(user.Id))
            {
                await ((IWebSocketSender)this).SendToUserAsync(userId, new { type = "error", message = "Debes esperar antes de volver a unirte." });
                return;
            }


            ActiveGameSession session = await GetOrLoadTableAsync(tableId);
            if (session == null)
            {
                Console.WriteLine($"[ERROR] No se pudo obtener sesión para mesa {tableId}");
                return;
            }

            Table table = session.Table;

            (bool success, string errorMessage) addResult;

            var semaphore = _tableLocks.GetOrAdd(tableId, _ => new SemaphoreSlim(1, 1));
            await semaphore.WaitAsync();
            try
            {
                using var betScope = _serviceProvider.CreateScope();
                var betInfoProvider = betScope.ServiceProvider.GetRequiredService<GameBetInfoProviderResolver>().Resolve(table.GameType);
                int minimumCoins = betInfoProvider.GetMinimumRequiredCoins();

                if (user.Coins < minimumCoins)
                {
                    Console.WriteLine($"❌ {user.NickName} tiene {user.Coins} monedas, pero se requieren al menos {minimumCoins} para unirse a esta mesa.");
                    await ((IWebSocketSender)this).SendToUserAsync(userId, new
                    {
                        type = Type,
                        action = "error",
                        message = $"Necesitas al menos {minimumCoins} monedas para unirte a esta mesa."
                    });
                    return;
                }

                addResult = tableManager.TryAddPlayer(table, user);
            }
            finally
            {
                semaphore.Release();
            }


            if (!addResult.success)
            {
                string errorType = addResult.errorMessage;

                if (errorType == "maintenance")
                {
                    await ((IWebSocketSender)this).SendToUserAsync(userId, new
                    {
                        type = Type,
                        action = "table_closed",
                        tableId = table.Id,
                        message = "Esta mesa está en mantenimiento y no se puede acceder por el momento."
                    });
                }
                else
                {
                    await ((IWebSocketSender)this).SendToUserAsync(userId, new
                    {
                        type = Type,
                        action = "error",
                        message = errorType
                    });
                }

                return;
            }

            await ((IWebSocketSender)this).BroadcastToUsersAsync(
                session.GetConnectedUserIds(),
                new
                {
                    type = Type,
                    action = GameTableMessageTypes.TableUpdate,
                    tableId = session.Table.Id,
                    players = session.GetPlayerNames(),
                    state = session.Table.TableState.ToString()
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
            var gameJoinHelperResolver = gameScope.ServiceProvider.GetRequiredService<GameJoinHelperResolver>();

            var joinHelper = gameJoinHelperResolver.Resolve(table.GameType);

            if (joinHelper != null)
            {
                await joinHelper.NotifyPlayerCanJoinCurrentMatchIfPossible(userIdInt, table, (IWebSocketSender)this);
            }


            if (table.Players.Count >= table.MinPlayer && table.TableState == TableState.Waiting && !HasActiveMatch(table.Id))
            {
                Console.WriteLine($"🔍 [HandleJoinTableAsync] Mesa {table.Id} cumple minPlayer. Estado actual: {table.TableState}");

                session.StartOrRestartCountdown();
                table.TableState = TableState.Starting;
                Console.WriteLine($"✅ [HandleJoinTableAsync] Estado de mesa {table.Id} cambiado a: {table.TableState}");

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
                Console.WriteLine($"⏳ [HandleJoinTableAsync] Mesa {table.Id} aún no cumple condiciones para cambiar a 'Starting'. Jugadores: {table.Players.Count}/{table.MinPlayer}");
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


    private async Task HandleLeaveTableAsync(string userId, JsonElement message)
    {
        if (!message.TryGetProperty("tableId", out JsonElement tableIdProp) ||
            !int.TryParse(tableIdProp.GetString(), out int tableId) ||
            !int.TryParse(userId, out int userIdInt))
            return;

        if (ActiveGameMatchStore.TryGet(tableId, out Match match) && match.MatchState == MatchState.InProgress)
        {
            Console.WriteLine($"[LeaveTable] Jugador {userId} intentó salir durante un Match activo. Ejecutando LeaveMatch automáticamente.");

            var gameMatchWS = _serviceProvider.GetRequiredService<GameMatchWS>();
            await gameMatchWS.ProcessPlayerMatchLeaveAsync(tableId, int.Parse(userId));
            return; 
        }

        if (!ActiveGameSessionStore.TryGet(tableId, out ActiveGameSession session))
            return;

        Table table = session.Table;
        PlayerLeaveResult result;

        IServiceScope scope;
        GameTableManager tableManager = GetScopedService<GameTableManager>(out scope);
        using (scope)
        {
            UnitOfWork unitOfWork = scope.ServiceProvider.GetRequiredService<UnitOfWork>();

            lock (table)
            {
                result = tableManager.ProcessPlayerLeaving(table, session, userIdInt);
                if (!result.PlayerRemoved)
                    return;
            }

            // 🧾 Cerrar historial si lo hay
            var history = await unitOfWork.GameHistoryRepository.FindActiveSessionAsync(userIdInt, table.Id);

            if (history != null && history.LeftAt == null)
            {
                history.LeftAt = DateTime.Now;
                unitOfWork.GameHistoryRepository.Update(history);
                await unitOfWork.SaveAsync();

                Console.WriteLine($"✅ Historial cerrado para jugador {userIdInt} al salir de la mesa {tableId}.");
            }

            if (result.StopCountdown)
            {
                await BroadcastCountdownStoppedAsync(table.Id, result.ConnectedUsers);
            }

            if (result.StateChanged)
            {
                unitOfWork.GameTableRepository.Update(table);
                await unitOfWork.SaveAsync();
            }

            await BroadcastTableUpdateAsync(table, result.ConnectedUsers, result.PlayerNames);
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
}