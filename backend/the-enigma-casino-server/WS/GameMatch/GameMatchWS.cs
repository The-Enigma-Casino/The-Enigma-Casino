using System.Text.Json;
using the_enigma_casino_server.Games.Shared.Entities;
using the_enigma_casino_server.Games.Shared.Entities.Enum;
using the_enigma_casino_server.Models.Database;
using the_enigma_casino_server.WS.Base;
using the_enigma_casino_server.WS.BlackJackWS;
using the_enigma_casino_server.WS.GameTableWS.Store;
using the_enigma_casino_server.WS.GameWS.Services;
using the_enigma_casino_server.WS.Interfaces;
using the_enigma_casino_server.WS.Resolver;

namespace the_enigma_casino_server.WS.GameMatch;

public class GameMatchWS : BaseWebSocketHandler, IWebSocketMessageHandler, IWebSocketSender
{
    public string Type => "gameMatch";

    private readonly BlackjackWS _blackjackWS;

    public GameMatchWS(ConnectionManagerWS connectionManager, IServiceProvider serviceProvider, BlackjackWS blackjackWS)
        : base(connectionManager, serviceProvider)
    {
        _blackjackWS = blackjackWS;
        connectionManager.OnUserDisconnected += HandleUserDisconnection;
    }


    private GameMatchManager CreateScopedManager(out IServiceScope scope)
    {
        scope = _serviceProvider.CreateScope();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<UnitOfWork>();
        return new GameMatchManager(unitOfWork);
    }



    public async Task HandleAsync(string userId, JsonElement message)
    {
        if (message.TryGetProperty("action", out JsonElement actionProp))
        {
            string action = actionProp.GetString();
            await (action switch
            {
                GameMatchMessageTypes.StartMatch => HandleStartMatchAsync(userId, message),
                GameMatchMessageTypes.LeaveMatch => HandleLeaveMatchAsync(userId, message),
                _ => Task.CompletedTask
            });
        }
    }


    private async Task HandleStartMatchAsync(string userId, JsonElement message)
    {
        if (!message.TryGetProperty("tableId", out var tableIdProp) ||
            !int.TryParse(tableIdProp.GetString(), out int tableId))
        {
            Console.WriteLine($"❌ start_match: tableId inválido.");
            return;
        }

        await StartMatchForTableAsync(tableId);
    }
    private async Task HandleLeaveMatchAsync(string userId, JsonElement message)
    {
        if (!int.TryParse(userId, out int userIdInt))
        {
            Console.WriteLine("❌ leave_match: userId inválido.");
            return;
        }

        if (!message.TryGetProperty("tableId", out var tableIdProp) ||
            !int.TryParse(tableIdProp.GetString(), out int tableId))
        {
            Console.WriteLine("❌ leave_match: tableId inválido.");
            return;
        }

        await EndMatchForPlayerAsync(tableId, userIdInt);
    }


    public async Task StartMatchForTableAsync(int tableId)
    {
        if (!ActiveGameSessionStore.TryGet(tableId, out var session))
        {
            Console.WriteLine($"❌ [GameMatchWS] No se encontró sesión activa para la mesa {tableId}");
            return;
        }

        Table table = session.Table;

        IServiceScope scope;
        UnitOfWork unitOfWork = GetScopedService<UnitOfWork>(out scope);
        using (scope)
        {
            GameMatchManager manager = new(unitOfWork);

            Match? match = await manager.StartMatchAsync(table);
            if (match == null)
                return;

            ActiveGameMatchStore.Set(table.Id, match);

            Console.WriteLine($"✅ [GameMatchWS] Partida iniciada en mesa {table.Id} con {match.Players.Count} jugadores.");

            var userIds = match.Players.Select(p => p.UserId.ToString()).ToArray();

            await ((IWebSocketSender)this).BroadcastToUsersAsync(userIds, new
            {
                type = GameMatchMessageTypes.MatchStarted,
                tableId = table.Id,
                matchId = 0,
                players = table.Players.Select(p => p.User.NickName).ToArray(),
                startedAt = match.StartedAt
            });

        }
    }



    private async Task EndMatchForPlayerAsync(int tableId, int userId)
    {
        if (!ActiveGameMatchStore.TryGet(tableId, out var match))
        {
            GameMatchHelper.LogMatchNotFound(tableId);
            return;
        }

        var unitOfWork = GetScopedService<UnitOfWork>(out var scope);
        using (scope)
        {
            var manager = new GameMatchManager(unitOfWork);
            var tableManager = scope.ServiceProvider.GetRequiredService<GameTableManager>();

            var player = GameMatchHelper.FindPlayer(match, userId);
            if (player == null) return;

            await manager.HandlePlayerExitAsync(player, match, tableId, _blackjackWS);

            await GameMatchHelper.NotifyPlayerMatchEndedAsync(this, userId, tableId);
            await GameMatchHelper.NotifyOthersPlayerLeftAsync(this, match, userId, tableId);

            await GameMatchHelper.TryCancelMatchAsync(this, match, manager, tableManager, tableId);
        }
    }




    public async Task EndMatchForAllPlayersAsync(int tableId)
    {
        Console.WriteLine("🧪 [BlackjackWS] No hay más jugadores activos. Evaluando y finalizando partida.");

        if (!ActiveGameMatchStore.TryGet(tableId, out var match))
        {
            Console.WriteLine($"❌ [GameMatchWS] No hay partida activa en la mesa {tableId}");
            return;
        }

        var unitOfWork = GetScopedService<UnitOfWork>(out var scope);
        using (scope)
        {
            var manager = new GameMatchManager(unitOfWork);

            await manager.EndMatchAsync(match);
            ActiveGameMatchStore.Remove(tableId);

            Console.WriteLine($"🧾 [GameMatchWS] Match finalizado y guardado en la mesa {tableId}");

            var userIds = match.GameTable.Players.Select(p => p.UserId.ToString()).ToList();

            await ((IWebSocketSender)this).BroadcastToUsersAsync(userIds, new
            {
                type = GameMatchMessageTypes.MatchEnded,
                tableId,
                endedAt = DateTime.UtcNow
            });

            if (ActiveGameSessionStore.TryGet(tableId, out var session))
            {
                Table table = session.Table;

                if (table.Players.Count >= table.MinPlayer)
                {
                    Console.WriteLine($"🕹 [GameMatchWS] Hay suficientes jugadores, iniciando nueva partida en mesa {table.Id}");
                    await StartMatchForTableAsync(table.Id);
                }
                else
                {
                    if (table.GameType == GameType.Poker && table.Players.Count < table.MinPlayer)
                    {
                        Console.WriteLine($"🚫 [GameMatchWS] Jugadores insuficientes para Poker. Expulsando a todos de la mesa {table.Id}.");

                        foreach (var player in table.Players.ToList())
                        {
                            await EndMatchForPlayerAsync(table.Id, player.UserId);
                        }
                    }
                    else
                    {
                        Console.WriteLine($"🕹 [GameMatchWS] No se inicia nueva partida, pero el juego permite continuar con {table.Players.Count} jugador(es).");
                    }
                }
            }
        }
    }


    private async void HandleUserDisconnection(string userId)
    {
        if (!int.TryParse(userId, out int userIdInt))
            return;

        foreach (var (tableId, match) in ActiveGameMatchStore.GetAll())
        {
            if (match.Players.Any(p => p.UserId == userIdInt))
            {
                await EndMatchForPlayerAsync(tableId, userIdInt);
                break;
            }
        }
    }
}