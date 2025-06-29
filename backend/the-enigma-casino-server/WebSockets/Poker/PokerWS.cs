﻿using System.Text.Json;
using the_enigma_casino_server.Games.Poker;
using the_enigma_casino_server.Games.Shared.Entities;
using the_enigma_casino_server.Games.Shared.Enum;
using the_enigma_casino_server.Infrastructure.Database;
using the_enigma_casino_server.Websockets.Poker;
using the_enigma_casino_server.WebSockets.Base;
using the_enigma_casino_server.WebSockets.GameMatch;
using the_enigma_casino_server.WebSockets.GameTable.Store;
using the_enigma_casino_server.WebSockets.Interfaces;
using the_enigma_casino_server.WebSockets.Poker.Store;
using the_enigma_casino_server.WebSockets.Resolvers;
using the_enigma_casino_server.WebSockets.Resolversl;


namespace the_enigma_casino_server.WebSockets.Poker;

public class PokerWS : BaseWebSocketHandler, IWebSocketMessageHandler
{
    public string Type => "poker";


    public PokerWS(ConnectionManagerWS connectionManager, IServiceProvider serviceProvider)
        : base(connectionManager, serviceProvider)
    {
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
        if (!TryGetTableId(message, out var tableId)) return;

        if (message.TryGetProperty("action", out JsonElement actionProp))
        {
            string action = actionProp.GetString()!;

            await (action switch
            {
                PokerMessageType.PlaceBet => HandlePlaceBetAsync(userId, message),
                PokerMessageType.PlayerAction => HandlePlayerActionAsync(userId, message),
                PokerMessageType.DealFlop => HandleDealFlopAsync(message),
                PokerMessageType.DealTurn => HandleDealTurnAsync(message),
                PokerMessageType.DealRiver => HandleDealRiverAsync(message),
                PokerMessageType.Showdown => HandleShowdownAsync(tableId),
                _ => Task.CompletedTask
            });
        }
    }

    public async Task StartInitialDealAsync(Match match)
    {
        int tableId = match.GameTableId;

        PokerNotifier notifier = _serviceProvider.GetRequiredService<PokerNotifier>();

        await notifier.NotifyPlayersInitializedAsync(match);

        PokerGame pokerGame = PokerManager.StartNewRound(match);

        await notifier.NotifyBlindsAsync(match, pokerGame);

        UnitOfWork unitOfWork = GetScopedService<UnitOfWork>(out IServiceScope scope);
        using (scope)
        {
            var smallBlind = match.Players.FirstOrDefault(p => p.UserId == pokerGame.GetSmallBlind().UserId);
            var bigBlind = match.Players.FirstOrDefault(p => p.UserId == pokerGame.GetBigBlind().UserId);

            if (smallBlind != null)
                await PokerManager.UpdatePlayerCoinsAsync(unitOfWork, smallBlind);

            if (bigBlind != null)
                await PokerManager.UpdatePlayerCoinsAsync(unitOfWork, bigBlind);
        }

        await notifier.SendInitialHandsAsync(match);
        await notifier.NotifyStartBettingAsync(match);

        PokerActionTracker.Clear(tableId, "preflop");

        int firstTurnUserId = pokerGame.CurrentTurnUserId;
        Player? firstPlayer = match.Players.FirstOrDefault(p => p.UserId == firstTurnUserId);

        if (firstPlayer != null)
        {
            await NotifyPlayerTurnWithTimerAsync(match, "preflop", firstPlayer);
        }
    }

    private async Task HandlePlayerActionAsync(string userId, JsonElement message)
    {
        if (!TryGetTableId(message, out var tableId) ||
            !TryGetMatch(tableId, userId, out var match) ||
            !TryGetPlayer(match, userId, out var player) ||
            !TryGetPokerGame(tableId, userId, out var pokerGame))
            return;

        PokerNotifier notifier = _serviceProvider.GetRequiredService<PokerNotifier>();

        if (pokerGame.CurrentTurnUserId != player.UserId)
        {
            await SendErrorAsync(userId, "No es tu turno.", Type);
            return;
        }

        if (ActiveGameSessionStore.TryGet(tableId, out var session))
        {
            session.CancelTurnTimer();
        }

        if (!message.TryGetProperty("move", out var moveProp))
        {
            await SendErrorAsync(userId, "Falta la acción (move).", Type);
            return;
        }

        string move = moveProp.GetString()?.ToLower() ?? "";
        int amount = message.TryGetProperty("amount", out var amountProp) ? amountProp.GetInt32() : 0;

        string phase = pokerGame.GetCurrentPhase();

        bool shouldAdvance = false;
        bool phaseAdvanced = false;

        try
        {
            shouldAdvance = PokerManager.ExecutePlayerMove(pokerGame, match, player, move, amount);

            if (move is "call" or "raise" or "all-in")
                await HandleBetAndNotifyAsync(player);

            await notifier.NotifyPlayerActionAsync(player, move);

            if (pokerGame.ShouldHandleImmediateWinner())
            {
                await HandleImmediateWinnerAsync(tableId);
                return;
            }

            if (pokerGame.ShouldHandleAllInShowdown())
            {
                await HandleAllInShowdownAsync(tableId);
                return;
            }

            if (shouldAdvance || move == "fold")
            {
                bool hasNextTurn = pokerGame.AdvanceTurn();

                if (!hasNextTurn)
                {
                    await HandlePhaseAdvanceAsync(tableId, phase);
                    phaseAdvanced = true;
                }
                else
                {
                    int nextUserId = pokerGame.CurrentTurnUserId;
                    Player? nextPlayer = match.Players.FirstOrDefault(p => p.UserId == nextUserId);

                    if (nextPlayer != null && !PokerActionTracker.HasPlayerActed(tableId, nextPlayer.UserId, phase))
                    {
                        await NotifyPlayerTurnWithTimerAsync(match, phase, nextPlayer);
                    }
                }
            }
        }
        catch (Exception ex)
        {
            await SendErrorAsync(userId, ex.Message, Type);
            return;
        }

        await PokerManager.RegisterPlayerActionAsync(tableId, player.UserId, phase);

        if (!phaseAdvanced)
        {
            await PokerManager.MaybeAdvancePhaseAsync(
                tableId,
                match,
                phase,
                HandlePhaseAdvanceAsync
            );
        }
    }



    private async Task HandlePlaceBetAsync(string userId, JsonElement message)
    {
        if (!TryGetTableId(message, out int tableId)) return;
        if (!TryGetMatch(tableId, userId, out var match)) return;
        if (!TryGetPlayer(match, userId, out var player)) return;
        if (!TryGetPokerGame(tableId, userId, out var pokerGame)) return;

        if (!message.TryGetProperty("amount", out var amountProp) || !amountProp.TryGetInt32(out int amount))
        {
            await SendErrorAsync(userId, "Monto de apuesta inválido.", Type);
            return;
        }

        if (!message.TryGetProperty("phase", out var phaseProp))
        {
            await SendErrorAsync(userId, "Fase no especificada.", Type);
            return;
        }

        string phase = phaseProp.GetString()!;

        try
        {
            pokerGame.HandlePokerBet(player, amount);
            await HandleBetAndNotifyAsync(player);
        }
        catch (Exception ex)
        {
            await SendErrorAsync(userId, ex.Message, Type);
            return;
        }

        await PokerManager.RegisterPlayerActionAsync(tableId, player.UserId, phase);

        await PokerManager.MaybeAdvancePhaseAsync(
            tableId,
            match,
            phase,
            HandlePhaseAdvanceAsync
        );
    }


    private async Task HandleDealPhaseAsync(string phase, int tableId)
    {
        if (!TryGetPokerGame(tableId, "system", out var pokerGame)) return;
        if (!TryGetMatch(tableId, "system", out var match)) return;


        string actionName;
        switch (phase)
        {
            case "flop":
                pokerGame.DealFlop();
                actionName = "flop_dealt";
                break;

            case "turn":
                pokerGame.DealTurn();
                actionName = "turn_dealt";
                break;

            case "river":
                pokerGame.DealRiver();
                actionName = "river_dealt";
                break;

            default:
                Console.WriteLine($"❌ Fase no válida: {phase}");
                return;
        }

        pokerGame.StartTurn(phase);

        List<Card> communityCards = pokerGame.GetCommunityCards();

        var response = new
        {
            type = Type,
            action = actionName,
            cards = communityCards.Select(c => new
            {
                suit = c.Suit.ToString().ToLowerInvariant(),
                rank = c.Rank.ToString().ToLowerInvariant(),
            }).ToList()
        };


        List<string> userIds = match.Players
            .Where(p => p.PlayerState != PlayerState.Spectating && !p.HasAbandoned)
            .Select(p => p.UserId.ToString())
            .ToList();

        await ((IWebSocketSender)this).BroadcastToUsersAsync(userIds, response);

        PokerActionTracker.Clear(tableId, phase);

        Player? nextPlayer = match.Players.FirstOrDefault(p => p.UserId == pokerGame.CurrentTurnUserId);
        if (nextPlayer != null)
        {
            await NotifyPlayerTurnWithTimerAsync(match, phase, nextPlayer);
        }
    }


    private async Task HandlePhaseAdvanceAsync(int tableId, string phase)
    {
        switch (phase)
        {
            case "preflop":
                await HandleDealPhaseAsync("flop", tableId);
                break;
            case "flop":
                await HandleDealPhaseAsync("turn", tableId);
                break;
            case "turn":
                await HandleDealPhaseAsync("river", tableId);
                break;
            case "river":
                await HandleShowdownAsync(tableId);
                break;
            default:
                Console.WriteLine($"⚠️ Fase desconocida: {phase}");
                break;
        }
    }


    private async Task HandleDealFlopAsync(JsonElement message)
    {
        if (!TryGetTableId(message, out int tableId)) return;

        if (!TryGetPokerGame(tableId, "system", out var pokerGame)) return;
        if (!TryGetMatch(tableId, "system", out var match)) return;

        pokerGame.DealFlop();
        pokerGame.StartTurn("flop");

        var response = new
        {
            type = Type,
            action = "flop_dealt",
            cards = pokerGame.GetCommunityCards().Select(c => new
            {
                suit = c.Suit.ToString(),
                rank = c.Rank.ToString(),
            })
            .ToList()
        };

        List<string> userIds = match.Players
            .Where(p => p.PlayerState != PlayerState.Spectating && !p.HasAbandoned)
            .Select(p => p.UserId.ToString())
            .ToList();

        await ((IWebSocketSender)this).BroadcastToUsersAsync(userIds, response);

        PokerActionTracker.Clear(tableId, "flop");
    }

    private async Task HandleDealTurnAsync(JsonElement message)
    {
        if (!TryGetTableId(message, out var tableId)) return;
        if (!TryGetPokerGame(tableId, "system", out var pokerGame)) return;
        if (!TryGetMatch(tableId, "system", out var match)) return;

        pokerGame.DealTurn();
        pokerGame.StartTurn("turn");

        List<Card> communityCards = pokerGame.GetCommunityCards();

        PokerHelper.ShowCommunityCards(communityCards);

        var response = new
        {
            type = Type,
            action = "turn_dealt",
            cards = pokerGame.GetCommunityCards().Select(c => new
            {
                suit = c.Suit.ToString(),
                rank = c.Rank.ToString(),
            })
            .ToList()
        };

        List<string> userIds = match.Players
            .Where(p => p.PlayerState != PlayerState.Spectating && !p.HasAbandoned)
            .Select(p => p.UserId.ToString())
            .ToList();

        await ((IWebSocketSender)this).BroadcastToUsersAsync(userIds, response);

        PokerActionTracker.Clear(tableId, "turn");
    }

    private async Task HandleDealRiverAsync(JsonElement message)
    {
        if (!TryGetTableId(message, out int tableId)) return;
        if (!TryGetPokerGame(tableId, "system", out var pokerGame)) return;
        if (!TryGetMatch(tableId, "system", out var match)) return;

        pokerGame.DealRiver();
        pokerGame.StartTurn("river");

        List<Card> communityCards = pokerGame.GetCommunityCards();

        var response = new
        {
            type = Type,
            action = "river_dealt",
            cards = pokerGame.GetCommunityCards().Select(c => new
            {
                suit = c.Suit.ToString(),
                rank = c.Rank.ToString(),
            })
            .ToList()
        };

        List<string> playerIds = match.Players
            .Where(p => p.PlayerState != PlayerState.Spectating && !p.HasAbandoned)
            .Select(p => p.UserId.ToString())
            .ToList();

        await ((IWebSocketSender)this).BroadcastToUsersAsync(playerIds, response);

        PokerActionTracker.Clear(tableId, "river");
    }

    private async Task HandleShowdownAsync(int tableId)
    {
        if (!TryGetPokerGame(tableId, out var pokerGame)) return;
        if (!TryGetMatch(tableId, out var match)) return;

        pokerGame.GeneratePots();
        pokerGame.Showdown();

        using (var coinsScope = _serviceProvider.CreateScope())
        {
            var unitOfWork = coinsScope.ServiceProvider.GetRequiredService<UnitOfWork>();

            foreach (var player in match.Players)
            {
                if (player.PlayerState is PlayerState.Playing or PlayerState.AllIn or PlayerState.Win)
                {
                    unitOfWork.UserRepository.Update(player.User);
                }
            }

            await unitOfWork.SaveAsync();
        }


        var revealedHands = match.Players
            .Where(p =>
                p.PlayerState != PlayerState.Fold &&
                p.PlayerState != PlayerState.Spectating &&
                !p.HasAbandoned)
            .Select(p => new
            {
                userId = p.UserId,
                cards = p.Hand.Cards.Select(c => new
                {
                    rank = (int)c.Rank,
                    suit = (int)c.Suit
                }).ToList()
            }).ToList();


        var summary = pokerGame.GetShowdownSummary();
        var response = new
        {
            type = Type,
            action = "round_result",
            summary,
            revealedHands
        };

        List<string> userIds = match.Players
            .Where(p => p.PlayerState != PlayerState.Spectating && !p.HasAbandoned)
            .Select(p => p.UserId.ToString())
            .ToList();

        await ((IWebSocketSender)this).BroadcastToUsersAsync(userIds, response);

        using (IServiceScope scope = _serviceProvider.CreateScope())
        {
            var gameMatchWS = scope.ServiceProvider.GetRequiredService<GameMatchWS>();
            await gameMatchWS.FinalizeMatchAsync(tableId);

            if (ActiveGameSessionStore.TryGet(tableId, out var sessionToCancel))
            {
                sessionToCancel.CancelTurnTimer();
                sessionToCancel.CancelBettingTimer();
                sessionToCancel.CancelPostMatchTimer();
            }

            var tracker = scope.ServiceProvider.GetRequiredService<PokerInactivityTracker>();
            CleanupInactivePlayers(match, tracker);
            PokerBetTracker.ResetContributions(tableId);
        }

        if (ActiveGameSessionStore.TryGet(tableId, out var session))
        {
            session.StartPostMatchTimer(20_000, async () =>
            {
                using var postMatchScope = _serviceProvider.CreateScope();
                var gameMatchWS = postMatchScope.ServiceProvider.GetRequiredService<GameMatchWS>();
                await gameMatchWS.EvaluatePostMatchAsync(tableId);
            });
        }
        else
        {
            Console.WriteLine($"[PokerWS] ❌ No se encontró sesión activa para mesa {tableId}, no se configuró el timer.");
        }
    }


    private async Task HandleBetAndNotifyAsync(Player player)
    {
        UnitOfWork unitOfWork = GetScopedService<UnitOfWork>(out IServiceScope scope);
        PokerNotifier notifier = _serviceProvider.GetRequiredService<PokerNotifier>();

        using (scope)
        {
            await PokerManager.UpdatePlayerCoinsAsync(unitOfWork, player);
        }
        await notifier.NotifyBetConfirmedAsync(player);
    }

    public async Task HandleImmediateWinnerAsync(int tableId, int? disconnectedUserId = null)
    {
        if (!TryGetPokerGame(tableId, "system", out var pokerGame)) return;
        if (!TryGetMatch(tableId, "system", out var match)) return;

        var winner = match.Players.FirstOrDefault(p =>
            p.UserId != disconnectedUserId &&
            p.PlayerState is PlayerState.Playing or PlayerState.AllIn);

        var loser = match.Players.FirstOrDefault(p =>
            p.UserId == disconnectedUserId &&
            p.PlayerState is PlayerState.Playing or PlayerState.AllIn);

        if (winner == null)
        {
            Console.WriteLine($"[PokerWS] ❌ No se pudo determinar un ganador válido en mesa {tableId}.");
            return;
        }

        Console.WriteLine($"[PokerWS] 🛑 Solo queda {winner.User.NickName} tras salida de {loser?.User.NickName ?? "otro jugador"}. Notificando...");

        await ((IWebSocketSender)this).SendToUserAsync(winner.UserId.ToString(), new
        {
            type = "poker",
            action = "opponent_left",
            message = "El otro jugador ha abandonado. Has ganado esta ronda automáticamente."
        });

        if (loser != null)
        {
            loser.PlayerState = PlayerState.Fold;
            Console.WriteLine($"[PokerWS] 🧹 Marcado {loser.User.NickName} como Fold antes del Showdown.");
        }

        await HandleShowdownAsync(tableId);

        if (!ActiveGameSessionStore.TryGet(tableId, out _))
        {
            using var scope = _serviceProvider.CreateScope();
            var gameMatchWS = scope.ServiceProvider.GetRequiredService<GameMatchWS>();
            await gameMatchWS.EvaluatePostMatchAsync(tableId);
        }
    }



    private async Task HandleAllInShowdownAsync(int tableId)
    {
        if (!TryGetPokerGame(tableId, "system", out var pokerGame)) return;
        if (!TryGetMatch(tableId, "system", out var match)) return;

        while (pokerGame.GetCurrentPhase() != "river")
        {
            if (pokerGame.GetCurrentPhase() == "preflop")
                pokerGame.DealFlop();
            else if (pokerGame.GetCurrentPhase() == "flop")
                pokerGame.DealTurn();
            else if (pokerGame.GetCurrentPhase() == "turn")
                pokerGame.DealRiver();
        }

        await HandleShowdownAsync(tableId);
    }


    private bool TryGetPokerGame(int tableId, out PokerGame pokerGame)
    => TryGetWithError(ActivePokerGameStore.TryGetNullable, tableId, out pokerGame, "partida de Poker");

    private bool TryGetPokerGame(int tableId, string? userId, out PokerGame pokerGame)
        => TryGetWithError(ActivePokerGameStore.TryGetNullable, tableId, out pokerGame, "partida de Poker", userId);

    private async Task NotifyPlayerTurnWithTimerAsync(Match match, string phase, Player player)
    {
        int tableId = match.GameTableId;

        if (!ActivePokerGameStore.TryGet(tableId, out var pokerGame))
            return;

        int remaining = match.Players.Count(p => p.PlayerState is PlayerState.Playing or PlayerState.AllIn);

        if (remaining == 1)
        {
            await HandleImmediateWinnerAsync(match.GameTableId);
            return;
        }

        var notifier = _serviceProvider.GetRequiredService<PokerNotifier>();
        await notifier.NotifyPlayerTurnAsync(match, player, pokerGame);

        await ((IWebSocketSender)this).SendToUserAsync(player.UserId.ToString(), new
        {
            type = "poker",
            action = "turn_timer",
            tableId,
            userId = player.UserId,
            phase,
            time = 20
        });

        if (ActiveGameSessionStore.TryGet(tableId, out var session))
        {
            session.StartTurnTimer(20_000, () => HandlePlayerTimeoutAsync(match, phase, player));
        }
    }

    private async Task HandlePlayerTimeoutAsync(Match match, string phase, Player player)
    {
        int tableId = match.GameTableId;

        using var scope = _serviceProvider.CreateScope();
        var tracker = scope.ServiceProvider.GetRequiredService<PokerInactivityTracker>();
        var turnService = scope.ServiceProvider.GetRequiredService<PokerTurnService>();

        tracker.RegisterInactivity(player);

        if (tracker.GetInactivityCount(player) >= 2)
        {
            player.HasAbandoned = true;
            tracker.RemovePlayer(player);

            await ((IWebSocketSender)this).SendToUserAsync(player.UserId.ToString(), new
            {
                type = "poker",
                action = "removed_by_inactivity",
                message = "Has sido eliminado de la partida de poker por inactividad."
            });
        }


        player.PlayerState = PlayerState.Fold;
        await turnService.ForceAdvanceTurnAsync(tableId, player.UserId);

        if (ActivePokerGameStore.TryGet(tableId, out var pokerGame))
        {
            if (pokerGame.CurrentTurnUserId == player.UserId)
            {
                bool hasAdvanced = pokerGame.AdvanceTurn();
            }

            int remaining = match.Players.Count(p => p.PlayerState is PlayerState.Playing or PlayerState.AllIn);

            if (remaining == 1)
            {
                if (await CheckForImmediateWinnerAsync(tableId, "TIMEOUT")) return;

                if (ActiveGameSessionStore.TryGet(tableId, out var session))
                {
                    session.StartPostMatchTimer(20_000, async () =>
                    {
                        using var postScope = _serviceProvider.CreateScope();
                        var gmws = postScope.ServiceProvider.GetRequiredService<GameMatchWS>();
                        await gmws.EvaluatePostMatchAsync(tableId);
                    });
                }
                return;
            }

            Player? nextPlayer = match.Players.FirstOrDefault(p => p.UserId == pokerGame.CurrentTurnUserId);

            if (nextPlayer != null &&
                nextPlayer.PlayerState == PlayerState.Playing &&
                !nextPlayer.HasAbandoned &&
                !PokerActionTracker.HasPlayerActed(tableId, nextPlayer.UserId, phase))
            {
                await NotifyPlayerTurnWithTimerAsync(match, phase, nextPlayer);
            }
            else
            {
                await PokerManager.MaybeAdvancePhaseAsync(
                    tableId, match, phase, HandlePhaseAdvanceAsync);
            }
        }
    }


    public async Task HandlePlayerDisconnectedAsync(int tableId, int userId)
    {
        if (!TryGetPokerGame(tableId, "system", out var pokerGame)) return;
        if (!TryGetMatch(tableId, "system", out var match)) return;

        var player = match.Players.FirstOrDefault(p => p.UserId == userId);
        if (player == null)
            return;

        string phase = pokerGame.GetCurrentPhase();

        var remainingPlayers = match.Players
         .Where(p => p.UserId != userId && p.PlayerState is PlayerState.Playing or PlayerState.AllIn)
         .ToList();

        if (remainingPlayers.Count == 1)
        {
            var winner = remainingPlayers[0];

            await ((IWebSocketSender)this).SendToUserAsync(winner.UserId.ToString(), new
            {
                type = "poker",
                action = "opponent_left",
                message = "El otro jugador ha abandonado. Has ganado esta ronda automáticamente."
            });

            await HandleImmediateWinnerAsync(tableId, userId);
            return;
        }


        bool hasNextTurn = pokerGame.AdvanceTurn();

        if (!hasNextTurn)
        {
            await HandlePhaseAdvanceAsync(tableId, phase);
            return;
        }

        int nextUserId = pokerGame.CurrentTurnUserId;
        Player? nextPlayer = match.Players.FirstOrDefault(p => p.UserId == nextUserId);
        if (nextPlayer != null)
        {
            await NotifyPlayerTurnWithTimerAsync(match, phase, nextPlayer);
        }
    }


    private void CleanupInactivePlayers(Match match, PokerInactivityTracker tracker)
    {
        foreach (var p in match.Players.Where(p => p.HasAbandoned || p.PlayerState == PlayerState.Left))
        {
            tracker.RemovePlayer(p);
        }
    }

    private async Task<bool> CheckForImmediateWinnerAsync(int tableId, string context)
    {
        if (!TryGetPokerGame(tableId, "system", out var pokerGame)) return false;
        if (!TryGetMatch(tableId, "system", out var match)) return false;

        int remaining = match.Players.Count(p => p.PlayerState is PlayerState.Playing or PlayerState.AllIn);

        if (remaining == 1)
        {
            await HandleImmediateWinnerAsync(tableId);
            return true;
        }

        return false;
    }

}