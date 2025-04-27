using System.Text.Json;
using the_enigma_casino_server.Games.Shared.Entities;
using the_enigma_casino_server.Games.Shared.Enum;
using the_enigma_casino_server.Infrastructure.Database;
using the_enigma_casino_server.Websockets.Roulette;
using the_enigma_casino_server.WebSockets.Base;
using the_enigma_casino_server.WebSockets.BlackJack;
using the_enigma_casino_server.WebSockets.GameMatch.Store;
using the_enigma_casino_server.WebSockets.GameTable;
using the_enigma_casino_server.WebSockets.GameTable.Store;
using the_enigma_casino_server.WebSockets.Handlers;
using the_enigma_casino_server.WebSockets.Interfaces;
using the_enigma_casino_server.WebSockets.Poker;
using the_enigma_casino_server.WebSockets.Resolvers;
using the_enigma_casino_server.WebSockets.Resolversl;


namespace the_enigma_casino_server.WebSockets.GameMatch;

public class GameMatchWS : BaseWebSocketHandler, IWebSocketMessageHandler, IWebSocketSender
{
    public string Type => "game_match";


    public GameMatchWS(
    ConnectionManagerWS connectionManager,
    IServiceProvider serviceProvider)
    : base(connectionManager, serviceProvider)
    {
        connectionManager.OnUserDisconnected += async userId =>
        {
            if (!int.TryParse(userId, out int userIdInt))
                return;

            foreach (var (tableId, match) in ActiveGameMatchStore.GetAll())
            {
                if (match.Players.Any(p => p.UserId == userIdInt))
                {
                    await ProcessPlayerMatchLeaveAsync(tableId, userIdInt);
                    break;
                }
            }
        };
    }

    private GameMatchManager CreateScopedManager(out IServiceScope scope)
    {
        scope = _serviceProvider.CreateScope();
        IServiceProvider provider = scope.ServiceProvider;

        UnitOfWork unitOfWork = provider.GetRequiredService<UnitOfWork>();
        GameBetInfoProviderResolver betInfoResolver = provider.GetRequiredService<GameBetInfoProviderResolver>();
        GameTurnServiceResolver turnResolver = provider.GetRequiredService<GameTurnServiceResolver>();
        GameSessionCleanerResolver sessionCleaner = provider.GetRequiredService<GameSessionCleanerResolver>();
        GameExitRuleResolver exitRuleResolver = provider.GetRequiredService<GameExitRuleResolver>();
        GameInactivityTrackerResolver inactivityTrackerResolver = provider.GetRequiredService<GameInactivityTrackerResolver>();

        return new GameMatchManager(unitOfWork, betInfoResolver, turnResolver, sessionCleaner, exitRuleResolver, inactivityTrackerResolver, provider);

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
            Console.WriteLine($"start_match: tableId inválido.");
            return;
        }

        await StartMatchForTableAsync(tableId);
    }
    private async Task HandleLeaveMatchAsync(string userId, JsonElement message)
    {
        if (!int.TryParse(userId, out int userIdInt))
        {
            Console.WriteLine("leave_match: userId inválido.");
            return;
        }

        if (!message.TryGetProperty("tableId", out var tableIdProp) ||
            !int.TryParse(tableIdProp.GetString(), out int tableId))
        {
            Console.WriteLine("leave_match: tableId inválido.");
            return;
        }

        await ProcessPlayerMatchLeaveAsync(tableId, userIdInt);
    }


    public async Task StartMatchForTableAsync(int tableId)
    {
        if (!ActiveGameSessionStore.TryGet(tableId, out ActiveGameSession session))
        {
            Console.WriteLine($"[GameMatchWS] No se encontró sesión activa para la mesa {tableId}");
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
       
            Console.WriteLine($"[GameMatchWS] Partida iniciada en mesa {table.Id} con {match.Players.Count} jugadores.");

            string[] userIds = match.Players.Select(p => p.UserId.ToString()).ToArray();

            await ((IWebSocketSender)this).BroadcastToUsersAsync(userIds, new
            {
                type = GameMatchMessageTypes.MatchStarted,
                tableId = table.Id,
                players = table.Players.Select(p => p.User.NickName).ToArray(),
                startedAt = match.StartedAt
            });
        }
    }

    public async Task ProcessPlayerMatchLeaveAsync(int tableId, int userId)
    {
        if (!ActiveGameMatchStore.TryGet(tableId, out Match match))
        {
            GameMatchHelper.LogMatchNotFound(tableId);
            return;
        }

        Console.WriteLine($"[DEBUG] Estado actual del Match en evento para mesa {tableId}: {match.MatchState}");


        if (match.MatchState != MatchState.InProgress)
        {
            Console.WriteLine($"[DEBUG] Ignorando LeaveMatch para la mesa {tableId} porque el Match ya terminó ({match.MatchState}).");
            return;
        }

        Player player = GameMatchHelper.FindPlayer(match, userId);
        if (player == null)
            return;


        IServiceScope scope;
        GameMatchManager manager = CreateScopedManager(out scope);

        using (scope)
        {
            IServiceProvider provider = scope.ServiceProvider;

            GameTableManager tableManager = provider.GetRequiredService<GameTableManager>();
            GameTurnServiceResolver turnResolver = provider.GetRequiredService<GameTurnServiceResolver>();
            IGameTurnService turnService = turnResolver.Resolve(match.GameTable.GameType);

            if (match.GameTable.GameType == GameType.BlackJack)
            {
                BlackjackBetTracker.RemovePlayer(tableId, userId);
            }

            if (match.GameTable.GameType == GameType.Poker)
            {
                BlackjackBetTracker.RemovePlayer(tableId, userId);
            }

            if (match.GameTable.GameType == GameType.Poker)
            {
                var pokerWS = _serviceProvider.GetRequiredService<PokerWS>();
                await pokerWS.HandlePlayerDisconnectedAsync(tableId, userId);
            }

            await manager.HandlePlayerExitAsync(player, match, tableId, turnService);
            await GameMatchHelper.NotifyPlayerMatchEndedAsync(this, userId, tableId);
            await GameMatchHelper.NotifyOthersPlayerLeftAsync(this, match, userId, tableId);
            await GameMatchHelper.TryCancelMatchAsync(this, match, manager, tableManager, tableId);
            await GameMatchHelper.CheckGamePostExitLogicAsync(match, tableId, _serviceProvider);

        }
    }

    public async Task FinalizeAndEvaluateMatchAsync(int tableId)
    {
        await FinalizeMatchAsync(tableId);
        await EvaluatePostMatchAsync(tableId);
    }

    public async Task FinalizeMatchAsync(int tableId)
    {
        if (!ActiveGameMatchStore.TryGet(tableId, out Match match))
        {
            Console.WriteLine($"❌ [GameMatchWS] No se encontró Match activo para la mesa {tableId}");
            return;
        }

        if (match.Players.Count == 0)
        {
            Console.WriteLine($"⚠️ [GameMatchWS] No hay jugadores en el Match activo de la mesa {tableId}");
            return;
        }

        IServiceScope scope;
        GameMatchManager manager = CreateScopedManager(out scope);

        using (scope)
        {
            await manager.EndMatchAsync(match);

            var tableManager = scope.ServiceProvider.GetRequiredService<GameTableManager>();
            foreach (Player player in match.GameTable.Players.ToList())
            {
                if (player.PlayerState == PlayerState.Left || player.HasAbandoned)
                {
                    player.PlayerState = PlayerState.Left;
                    tableManager.RemovePlayerFromTable(match.GameTable, player.UserId, out _);
                    Console.WriteLine($"🚪 {player.User.NickName} abandonó el match y fue eliminado de la mesa.");
                }
            }

            List<string> userIds = match.GameTable.Players
                .Select(p => p.UserId.ToString())
                .ToList();

            await ((IWebSocketSender)this).BroadcastToUsersAsync(userIds, new
            {
                type = GameMatchMessageTypes.MatchEnded,
                tableId,
                endedAt = DateTime.Now
            });
        }
    }

    public async Task EvaluatePostMatchAsync(int tableId)
    {

        if (!ActiveGameSessionStore.TryGet(tableId, out ActiveGameSession session))
            return;

        Table table = session.Table;

        using (var betScope = _serviceProvider.CreateScope())
        {
            var betInfoProvider = betScope.ServiceProvider.GetRequiredService<GameBetInfoProviderResolver>().Resolve(table.GameType);
            int minimumCoins = betInfoProvider.GetMinimumRequiredCoins();

            foreach (Player p in table.Players.Where(p => p.User.Coins < minimumCoins).ToList())
            {
                Console.WriteLine($"🚪 [PostMatch] {p.User.NickName} no tiene mínimo para jugar ({p.User.Coins} fichas). Eliminándolo de la mesa.");
                using (var scope = _serviceProvider.CreateScope())
                {
                    var tblMgr = scope.ServiceProvider.GetRequiredService<GameTableManager>();
                    tblMgr.RemovePlayerFromTable(table, p.UserId, out _);

                    await NotifyPlayerKickedAsync(p.UserId.ToString());

                    var uow = scope.ServiceProvider.GetRequiredService<UnitOfWork>();
                    var history = await uow.GameHistoryRepository.FindActiveSessionAsync(p.UserId, table.Id);
                    if (history != null && history.LeftAt == null)
                    {
                        history.LeftAt = DateTime.Now;
                        uow.GameHistoryRepository.Update(history);
                        await uow.SaveAsync();
                    }
                }
            }

            if (table.GameType == GameType.Poker)
            {
                foreach (Player p in table.Players.Where(p => p.HasAbandoned).ToList())
                {
                    Console.WriteLine($"🧹 [PostMatch] Eliminando jugador abandonado: {p.User.NickName}");
                    using var scope = _serviceProvider.CreateScope();
                    var tblMgr = scope.ServiceProvider.GetRequiredService<GameTableManager>();
                    tblMgr.RemovePlayerFromTable(table, p.UserId, out _);
                }
            }

            using (var scope = _serviceProvider.CreateScope())
            {
                var inactivityHandler = scope.ServiceProvider.GetRequiredService<GameInactivityHandler>();
                await inactivityHandler.HandleInactivityAsync(table);
            }


            if (table.Players.Count >= table.MinPlayer)
            {
                table.TableState = TableState.Starting;

                using var scope = _serviceProvider.CreateScope();
                var uow = scope.ServiceProvider.GetRequiredService<UnitOfWork>();
                uow.GameTableRepository.Update(table);
                await uow.SaveAsync();

                await StartMatchForTableAsync(table.Id);
                return;
            }


            if (table.GameType != GameType.Poker)
                return;

            if (table.Players.Count == 1)
            {
                var lone = table.Players[0];

                Console.WriteLine($"🚪 [PostMatch] Solo queda {lone.User.NickName}. Eliminándolo de la mesa y cerrando historial.");

                await ((IWebSocketSender)this).SendToUserAsync(lone.UserId.ToString(), new
                {
                    type = "game_match",
                    action = "return_to_table",
                    message = "Todos los demás jugadores han abandonado. Volverás a la sala principal."
                });


                lone.PlayerState = PlayerState.Left;
                lone.HasAbandoned = true;

                using (var scope = _serviceProvider.CreateScope())
                {
                    var tblMgr = scope.ServiceProvider.GetRequiredService<GameTableManager>();
                    tblMgr.RemovePlayerFromTable(table, lone.UserId, out _);
                }

                using (var scope = _serviceProvider.CreateScope())
                {
                    UnitOfWork uow = scope.ServiceProvider.GetRequiredService<UnitOfWork>();
                    History hist = await uow.GameHistoryRepository.FindActiveSessionAsync(lone.UserId, table.Id);

                    if (hist != null && hist.LeftAt == null)
                    {
                        hist.LeftAt = DateTime.Now;
                        uow.GameHistoryRepository.Update(hist);
                        await uow.SaveAsync();
                    }
                }
            }


            if (table.Players.Count == 0)
            {
                Console.WriteLine($"🕳️ [PostMatch] La mesa {table.Id} quedó vacía. Estado → Waiting.");
                table.TableState = TableState.Waiting;

                using var scope = _serviceProvider.CreateScope();
                var uow = scope.ServiceProvider.GetRequiredService<UnitOfWork>();
                uow.GameTableRepository.Update(table);
                await uow.SaveAsync();
            }
        }
    }

    private async Task NotifyPlayerKickedAsync(string userId)
    {
        await ((IWebSocketSender)this).SendToUserAsync(userId, new
        {
            type = "game_match",
            action = "eliminated_no_coins",
            message = "Te has quedado sin monedas suficientes para continuar. Has sido eliminado de la mesa."
        });
    }
}