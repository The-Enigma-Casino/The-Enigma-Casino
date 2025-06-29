﻿using System.Text.Json;
using the_enigma_casino_server.Games.Shared.Entities;
using the_enigma_casino_server.Games.Shared.Enum;
using the_enigma_casino_server.Infrastructure.Database;
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

    public GameMatchWS(ConnectionManagerWS connectionManager, IServiceProvider serviceProvider)
        : base(connectionManager, serviceProvider)
    {
        connectionManager.OnUserDisconnected += async userId =>
        {
            if (!int.TryParse(userId, out int userIdInt)) return;

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
            !int.TryParse(tableIdProp.GetString(), out int tableId)) return;

        await StartMatchForTableAsync(tableId);
    }

    private async Task HandleLeaveMatchAsync(string userId, JsonElement message)
    {
        if (!int.TryParse(userId, out int userIdInt)) return;
        if (!message.TryGetProperty("tableId", out var tableIdProp) ||
            !int.TryParse(tableIdProp.GetString(), out int tableId)) return;

        await ProcessPlayerMatchLeaveAsync(tableId, userIdInt);
    }

    public async Task StartMatchForTableAsync(int tableId)
    {

        if (!ActiveGameSessionStore.TryGet(tableId, out ActiveGameSession session)) return;

        var existingMatch = ActiveGameMatchStore.TryGetNullable(tableId);
        if (existingMatch != null && existingMatch.MatchState != MatchState.Finished) return;
        
        Table table = session.Table;
 
        IServiceScope scope;
        GameMatchManager manager = CreateScopedManager(out scope);
        using (scope)
        {
            Match match = await manager.StartMatchAsync(table);
            if (match == null) return;

            ActiveGameMatchStore.Set(table.Id, match);

            string[] userIds = match.Players.Select(p => p.UserId.ToString()).ToArray();

            await ((IWebSocketSender)this).BroadcastToUsersAsync(userIds, new
            {
                type = Type,
                action = GameMatchMessageTypes.MatchStarted,
                tableId = table.Id,
                players = table.Players.Select(p => p.User.NickName).ToArray(),
                startedAt = match.StartedAt
            });
        }
    }

    public async Task ProcessPlayerMatchLeaveAsync(int tableId, int userId)
    {
        if (!ActiveGameMatchStore.TryGet(tableId, out Match match)) return;

        if (match.MatchState != MatchState.InProgress) return;

        Player player = GameMatchHelper.FindPlayer(match, userId);
        if (player == null) return;

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
                var pokerWS = _serviceProvider.GetRequiredService<PokerWS>();
                await pokerWS.HandlePlayerDisconnectedAsync(tableId, userId);
            }

            await manager.HandlePlayerExitAsync(player, match, tableId, turnService);
            await GameMatchHelper.NotifyPlayerMatchEndedAsync(this, userId, tableId);
            await GameMatchHelper.NotifyOthersPlayerLeftAsync(this, match, userId, player.User.NickName, tableId);
            await GameMatchHelper.TryCancelMatchAsync(this, match, manager, tableManager, tableId);

            var table = match.GameTable;

            bool allPlayersGone = table.Players.All(p => p.PlayerState == PlayerState.Left || p.HasAbandoned);

            if (allPlayersGone)
            {
                var uow = scope.ServiceProvider.GetRequiredService<UnitOfWork>();

                table.TableState = TableState.Waiting;
                uow.GameTableRepository.Update(table);
                await uow.SaveAsync();

                if (ActiveGameSessionStore.TryGet(table.Id, out var session))
                {
                    session.CancelBettingTimer();
                    session.CancelTurnTimer();
                    session.CancelPostMatchTimer();
                }

                ActiveGameSessionStore.Remove(table.Id);
                ActiveGameMatchStore.Remove(table.Id);
            }
            else
            {
                var gameTableWS = _serviceProvider.GetRequiredService<GameTableWS>();
                await gameTableWS.TryPromoteSpectatorsAndStartMatchAsync(tableId);
            }

            await ((IWebSocketSender)this).SendToUserAsync(userId.ToString(), new
            {
                type = "game_table",
                action = "leave_success",
                userId
            });
        }
        await GameMatchHelper.CheckGamePostExitLogicAsync(match, tableId, _serviceProvider);

    }

    public async Task FinalizeAndEvaluateMatchAsync(int tableId)
    {
        await FinalizeMatchAsync(tableId);
        await EvaluatePostMatchAsync(tableId);
    }

    public async Task FinalizeMatchAsync(int tableId)
    {
        if (!ActiveGameMatchStore.TryGet(tableId, out Match match)) return;
        if (match.Players.Count == 0) return;

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
                }
            }

            List<string> userIds = match.GameTable.Players.Select(p => p.UserId.ToString()).ToList();
            await ((IWebSocketSender)this).BroadcastToUsersAsync(userIds, new
            {
                type = GameMatchMessageTypes.MatchEnded,
                tableId,
                endedAt = DateTime.Now
            });

            await CleanupTableIfEmptyAsync(tableId);
        }
    }

    public async Task EvaluatePostMatchAsync(int tableId)
    {
        if (!ActiveGameSessionStore.TryGet(tableId, out ActiveGameSession session)) return;

        Table table = session.Table;
        using (var betScope = _serviceProvider.CreateScope())
        {
            var betInfoProvider = betScope.ServiceProvider.GetRequiredService<GameBetInfoProviderResolver>().Resolve(table.GameType);
            int minimumCoins = betInfoProvider.GetMinimumRequiredCoins();

            foreach (Player p in table.Players.Where(p => p.User.Coins < minimumCoins).ToList())
            {
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
                var inactivityTracker = betScope.ServiceProvider.GetRequiredService<GameInactivityTrackerResolver>().Resolve(GameType.Poker);
                if (inactivityTracker is PokerInactivityTracker pokerTracker)
                {
                    foreach (var p in table.Players.Where(p => !p.HasAbandoned).ToList())
                    {
                        int count = pokerTracker.GetInactivityCount(p);
                        if (count >= 2)
                        {
                            p.HasAbandoned = true;
                            pokerTracker.RemovePlayer(p);
                        }
                    }
                }

                foreach (Player p in table.Players.Where(p => p.HasAbandoned).ToList())
                {
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

            await HandleSoloPlayerPostMatchAsync(session, table);

            if (table.Players.Count(p => p.PlayerState != PlayerState.Left && !p.HasAbandoned) >= table.MinPlayer)
            {
                table.TableState = TableState.Starting;
                using var scope = _serviceProvider.CreateScope();
                var uow = scope.ServiceProvider.GetRequiredService<UnitOfWork>();
                uow.GameTableRepository.Update(table);
                await uow.SaveAsync();
                await StartMatchForTableAsync(table.Id);
                return;
            }

            if (table.GameType != GameType.Poker) return;

            if (table.Players.Count == 0)
            {
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
            type = Type,
            action = "eliminated_no_coins",
            message = "Te has quedado sin monedas suficientes para continuar. Has sido eliminado de la mesa."
        });
    }

    private async Task CleanupTableIfEmptyAsync(int tableId)
    {
        using var scope = _serviceProvider.CreateScope();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<UnitOfWork>();

        if (!ActiveGameSessionStore.TryGet(tableId, out var session))
            return;

        var table = session.Table;

        bool noPlayers = table.Players.Count == 0 || table.Players.All(p => p.PlayerState == PlayerState.Left);

        if (noPlayers)
        {
            table.TableState = TableState.Waiting;
            unitOfWork.GameTableRepository.Update(table);
            await unitOfWork.SaveAsync();

            ActiveGameSessionStore.Remove(tableId);
            ActiveGameMatchStore.Remove(tableId);
        }
    }

    private async Task HandleSoloPlayerPostMatchAsync(ActiveGameSession session, Table table)
    {
        var activePlayers = table.Players
            .Where(p => p.PlayerState != PlayerState.Spectating && !p.HasAbandoned)
            .ToList();

        if (activePlayers.Count != 1) return;
        
        var lone = activePlayers[0];

        session.CancelTurnTimer();
        session.CancelBettingTimer();

        var spectators = table.Players
            .Where(p => p.PlayerState == PlayerState.Spectating && !p.HasAbandoned)
            .ToList();

        bool isPoker = table.GameType == GameType.Poker;

        if (spectators.Count == 0)
        {
            if (isPoker)
            {
                using var scope = _serviceProvider.CreateScope();
                var tblMgr = scope.ServiceProvider.GetRequiredService<GameTableManager>();
                var uow = scope.ServiceProvider.GetRequiredService<UnitOfWork>();

                lone.PlayerState = PlayerState.Left;
                lone.HasAbandoned = true;

                tblMgr.RemovePlayerFromTable(table, lone.UserId, out _);

                var hist = await uow.GameHistoryRepository.FindActiveSessionAsync(lone.UserId, table.Id);
                if (hist != null && hist.LeftAt == null)
                {
                    hist.LeftAt = DateTime.Now;
                    uow.GameHistoryRepository.Update(hist);
                    await uow.SaveAsync();
                }

                if (table.Players.Count == 0)
                {
                    table.TableState = TableState.Waiting;
                    uow.GameTableRepository.Update(table);
                    await uow.SaveAsync();

                    ActiveGameSessionStore.Remove(table.Id);
                    ActiveGameMatchStore.Remove(table.Id);
                }

                await ((IWebSocketSender)this).SendToUserAsync(lone.UserId.ToString(), new
                {
                    type = Type,
                    action = "return_to_table",
                    message = "Todos los demás jugadores han abandonado. Volverás a la sala principal."
                });
            }
            else
            {
                Console.WriteLine($"[HANDLE SOLO PLAYER] Juego {table.GameType} permite jugador solitario. No se cierra mesa.");
            }
        }
        else
        {
            foreach (var spectator in spectators)
            {
                spectator.PlayerState = PlayerState.Playing;

                string actionType = table.GameType switch
                {
                    GameType.BlackJack => "blackjack",
                    GameType.Poker => "poker",
                    GameType.Roulette => "roulette",
                    _ => "game_match"
                };

                await ((IWebSocketSender)this).SendToUserAsync(spectator.UserId.ToString(), new
                {
                    type = actionType,
                    action = "match_ready",
                    table.Id,
                    message = "¡Estás dentro de la próxima partida! Prepárate para jugar 🎲"
                });
            }

            table.TableState = TableState.Starting;

            using var scope = _serviceProvider.CreateScope();
            var uow = scope.ServiceProvider.GetRequiredService<UnitOfWork>();
            uow.GameTableRepository.Update(table);
            await uow.SaveAsync();

            await StartMatchForTableAsync(table.Id);
        }
    }

}


