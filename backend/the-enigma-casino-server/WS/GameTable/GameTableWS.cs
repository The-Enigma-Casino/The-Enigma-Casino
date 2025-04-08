
using System.Text.Json;
using the_enigma_casino_server.Games.Shared.Entities;
using the_enigma_casino_server.Games.Shared.Entities.Enum;
using the_enigma_casino_server.Games.Shared.Services;
using the_enigma_casino_server.Models.Database;
using the_enigma_casino_server.Models.Database.Entities;
using the_enigma_casino_server.WS.Base;
using the_enigma_casino_server.WS.GameMatch;
using the_enigma_casino_server.WS.GameTableWS.Models;
using the_enigma_casino_server.WS.GameTableWS.Store;
using the_enigma_casino_server.WS.GameWS.Services;
using the_enigma_casino_server.WS.Interfaces;
using the_enigma_casino_server.WS.Resolver;

namespace the_enigma_casino_server.WS.GameTable;

public class GameTableWS : BaseWebSocketHandler, IWebSocketMessageHandler
{
    private readonly GameTableManager _tableManager;
    public string Type => "gameTable";

    private readonly GameMatchWS _gameMatchWS;

    public GameTableWS(
        ConnectionManagerWS connectionManager,
        IServiceProvider serviceProvider,
        GameTableManager tableManager,
        GameMatchWS gameMatchWS)
        : base(connectionManager, serviceProvider)
    {
        _tableManager = tableManager;
        _gameMatchWS = gameMatchWS;
        connectionManager.OnUserDisconnected += HandleUserDisconnection;
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

            if (!_tableManager.CanJoinTable(user.Id))
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

            lock (table)
            {
                addResult = _tableManager.TryAddPlayer(table, user);
            }

            if (!addResult.success)
            {
                await ((IWebSocketSender)this).SendToUserAsync(userId, new
                {
                    type = "error",
                    message = addResult.errorMessage
                });
                return;
            }


            await ((IWebSocketSender)this).BroadcastToUsersAsync(
                session.GetConnectedUserIds(),
                new
                {
                    type = GameTableMessageTypes.TableUpdate,
                    tableId = session.Table.Id,
                    players = session.GetPlayerNames(),
                    state = session.Table.TableState.ToString()
                });


            if (table.Players.Count >= table.MinPlayer)
            {
                session.StartOrRestartCountdown();
            }

            await ((IWebSocketSender)this).BroadcastToUsersAsync(
                session.GetConnectedUserIds(),
                new
                {
                    type = GameTableMessageTypes.CountdownStarted,
                    tableId = table.Id,
                    countdown = 30
                });

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
            if (table.TableState != TableState.Waiting)
            {
                Console.WriteLine($"[GameTableWS] El estado de la mesa {tableId} ya no es 'Waiting' (es {table.TableState}).");
                return;
            }

            table.TableState = TableState.InProgress;
            shouldStart = true;
            userIds = table.Players.Select(p => p.UserId.ToString()).ToList();
        }

        if (shouldStart)
        {
            Console.WriteLine($"[GameTableWS] Iniciando partida en la mesa {tableId} automáticamente.");

            // Notificamos a los jugadores que el match empieza
            await ((IWebSocketSender)this).BroadcastToUsersAsync(userIds, new
            {
                type = GameTableMessageTypes.GameStart,
                tableId = table.Id
            });

            // Iniciamos la partida real con GameMatchWS
            await _gameMatchWS.StartMatchForTableAsync(tableId);
        }
    }


    private async Task HandleLeaveTableAsync(string userId, JsonElement message)
    {
        if (!message.TryGetProperty("tableId", out JsonElement tableIdProp) ||
            !int.TryParse(tableIdProp.GetString(), out int tableId) ||
            !int.TryParse(userId, out int userIdInt))
            return;

        if (!ActiveGameSessionStore.TryGet(tableId, out ActiveGameSession session))
            return;

        Table table = session.Table;

        PlayerLeaveResult result;

        lock (table)
        {
            result = _tableManager.ProcessPlayerLeaving(table, session, userIdInt);
            if (!result.PlayerRemoved)
                return;
        }

        if (result.StopCountdown)
        {
            await BroadcastCountdownStoppedAsync(table.Id, result.ConnectedUsers);
        }

        await BroadcastTableUpdateAsync(table, result.ConnectedUsers, result.PlayerNames);

    }


    private async void HandleUserDisconnection(string userId)
    {
        if (!int.TryParse(userId, out int userIdInt))
            return;

        foreach (var session in ActiveGameSessionStore.GetAll().Values)
        {
            Table table = session.Table;

            PlayerLeaveResult result;

            lock (table)
            {
                result = _tableManager.ProcessPlayerLeaving(table, session, userIdInt);
                if (!result.PlayerRemoved)
                    return;
            }

            if (result.StopCountdown)
            {
                await BroadcastCountdownStoppedAsync(table.Id, result.ConnectedUsers);
            }

            await BroadcastTableUpdateAsync(table, result.ConnectedUsers, result.PlayerNames);
        }
    }

    private Task BroadcastTableUpdateAsync(Table table, IEnumerable<string> userIds, string[] playerNames)
    {
        return ((IWebSocketSender)this).BroadcastToUsersAsync(userIds, new
        {
            type = GameTableMessageTypes.TableUpdate,
            tableId = table.Id,
            players = playerNames,
            state = table.TableState.ToString()
        });
    }

    private Task BroadcastCountdownStoppedAsync(int tableId, IEnumerable<string> userIds)
    {
        return ((IWebSocketSender)this).BroadcastToUsersAsync(userIds, new
        {
            type = GameTableMessageTypes.CountdownStopped,
            tableId
        });
    }
}