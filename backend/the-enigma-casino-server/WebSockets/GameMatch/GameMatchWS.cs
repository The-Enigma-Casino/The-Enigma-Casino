using System.Text.Json;
using the_enigma_casino_server.Games.Shared.Entities;
using the_enigma_casino_server.Games.Shared.Enum;
using the_enigma_casino_server.Infrastructure.Database;
using the_enigma_casino_server.WebSockets.Base;
using the_enigma_casino_server.WebSockets.BlackJack;
using the_enigma_casino_server.WebSockets.GameMatch.Store;
using the_enigma_casino_server.WebSockets.GameTable;
using the_enigma_casino_server.WebSockets.GameTable.Store;
using the_enigma_casino_server.WebSockets.Interfaces;
using the_enigma_casino_server.WebSockets.Resolvers;


namespace the_enigma_casino_server.WebSockets.GameMatch;

public class GameMatchWebSocket : BaseWebSocketHandler, IWebSocketMessageHandler, IWebSocketSender
{
    public string Type => "game_match";

    public GameMatchWebSocket(
    ConnectionManagerWS connectionManager,
    IServiceProvider serviceProvider)
    : base(connectionManager, serviceProvider)
    {
        connectionManager.OnUserDisconnected += HandleUserDisconnection;
    }

    private GameMatchManager CreateScopedManager(out IServiceScope scope)
    {
        scope = _serviceProvider.CreateScope();
        IServiceProvider provider = scope.ServiceProvider;

        UnitOfWork unitOfWork = provider.GetRequiredService<UnitOfWork>();
        GameBetInfoProviderResolver betInfoResolver = provider.GetRequiredService<GameBetInfoProviderResolver>();
        GameTurnServiceResolver turnResolver = provider.GetRequiredService<GameTurnServiceResolver>();
        GameSessionCleanerResolver sessionCleaner = provider.GetRequiredService<GameSessionCleanerResolver>();

        return new GameMatchManager(unitOfWork, betInfoResolver, turnResolver, sessionCleaner);
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
        if (!ActiveGameSessionStore.TryGet(tableId, out ActiveGameSession session))
        {
            Console.WriteLine($"❌ [GameMatchWS] No se encontró sesión activa para la mesa {tableId}");
            return;
        }

        Table table = session.Table;

        IServiceScope scope;
        GameMatchManager manager = CreateScopedManager(out scope);
        using (scope)
        {
            Match match = await manager.StartMatchAsync(table);
            if (match == null)
                return;

            ActiveGameMatchStore.Set(table.Id, match);

            Console.WriteLine($"✅ [GameMatchWS] Partida iniciada en mesa {table.Id} con {match.Players.Count} jugadores.");

            string[] userIds = match.Players.Select(p => p.UserId.ToString()).ToArray();

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
        if (!ActiveGameMatchStore.TryGet(tableId, out Match match))
        {
            GameMatchHelper.LogMatchNotFound(tableId);
            return;
        }

        IServiceScope scope;
        GameMatchManager manager = CreateScopedManager(out scope);
        using (scope)
        {
            GameTableManager tableManager = scope.ServiceProvider.GetRequiredService<GameTableManager>();

            Player player = GameMatchHelper.FindPlayer(match, userId);
            if (player == null) return;

            GameTurnServiceResolver turnResolver = scope.ServiceProvider.GetRequiredService<GameTurnServiceResolver>();
            IGameTurnService turnService = turnResolver.Resolve(match.GameTable.GameType);

            if (match.GameTable.GameType == GameType.BlackJack)
            {
                BlackjackBetTracker.RemovePlayer(tableId, userId);
            }

            await manager.HandlePlayerExitAsync(player, match, tableId, turnService);

            await GameMatchHelper.NotifyPlayerMatchEndedAsync(this, userId, tableId);
            await GameMatchHelper.NotifyOthersPlayerLeftAsync(this, match, userId, tableId);

            await GameMatchHelper.TryCancelMatchAsync(this, match, manager, tableManager, tableId);
        }
    }

    public async Task EndMatchForAllPlayersAsync(int tableId)
    {
        if (!ActiveGameMatchStore.TryGet(tableId, out Match match)) return;

        IServiceScope scope;
        GameMatchManager manager = CreateScopedManager(out scope);
        using (scope)
        {
            await manager.EndMatchAsync(match);
            ActiveGameMatchStore.Remove(tableId);

            List<string> userIds = match.GameTable.Players.Select(p => p.UserId.ToString()).ToList();

            await ((IWebSocketSender)this).BroadcastToUsersAsync(userIds, new
            {
                type = GameMatchMessageTypes.MatchEnded,
                tableId,
                endedAt = DateTime.Now
            });

            if (ActiveGameSessionStore.TryGet(tableId, out ActiveGameSession session))
            {
                Table table = session.Table;

                if (table.Players.Count >= table.MinPlayer)
                {
                    await StartMatchForTableAsync(table.Id);
                }
                else
                {
                    if (table.GameType == GameType.Poker && table.Players.Count < table.MinPlayer)
                    {
                        // TODO: Extraer esta lógica a una implementación de IGameRuleEvaluator (PokerRuleEvaluator)
                        foreach (Player player in table.Players.ToList())
                        {
                            await EndMatchForPlayerAsync(table.Id, player.UserId);
                        }
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