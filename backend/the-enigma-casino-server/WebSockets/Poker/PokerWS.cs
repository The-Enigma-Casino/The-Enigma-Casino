using System.Text.Json;
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


namespace the_enigma_casino_server.WebSockets.Poker;

public class PokerWS : BaseWebSocketHandler, IWebSocketMessageHandler
{
    public string Type => "poker";


    public PokerWS(ConnectionManagerWS connectionManager, IServiceProvider serviceProvider)
        : base(connectionManager, serviceProvider)
    {
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

        PokerGame pokerGame = PokerManager.StartNewRound(match);

        UnitOfWork unitOfWork = GetScopedService<UnitOfWork>(out var scope);
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

        int firstTurnUserId = pokerGame.CurrentTurnUserId;
        Player? firstPlayer = match.Players.FirstOrDefault(p => p.UserId == firstTurnUserId);

        if (firstPlayer != null)
        {
            await notifier.NotifyPlayerTurnAsync(match, firstPlayer);
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
            await SendErrorAsync(userId, "No es tu turno.");
            return;
        }

        if (!message.TryGetProperty("move", out var moveProp))
        {
            await SendErrorAsync(userId, "Falta la acción (move).");
            return;
        }

        string move = moveProp.GetString()?.ToLower() ?? "";
        int amount = message.TryGetProperty("amount", out var amountProp) ? amountProp.GetInt32() : 0;

        string phase = pokerGame.GetCurrentPhase();

        try
        {
            bool shouldAdvance = PokerManager.ExecutePlayerMove(pokerGame, match, player, move, amount);

            if (move is "call" or "raise" or "all-in")
                await HandleBetAndNotifyAsync(player);

            await notifier.NotifyPlayerActionAsync(player, move);

            if (shouldAdvance)
                await NotifyNextTurnAsync(tableId, pokerGame, match, phase, notifier);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Error en acción de jugador: {ex.Message}");
            await SendErrorAsync(userId, ex.Message);
            return;
        }

        await PokerManager.RegisterAndMaybeAdvancePhaseAsync(
            tableId,
            match,
            player,
            phase,
            HandlePhaseAdvanceAsync
        );
    }

    private async Task HandlePlaceBetAsync(string userId, JsonElement message)
    {
        Console.WriteLine("🎯 Entrando en HandlePlaceBetAsync");

        if (!TryGetTableId(message, out int tableId)) return;
        if (!TryGetMatch(tableId, userId, out var match)) return;
        if (!TryGetPlayer(match, userId, out var player)) return;
        if (!TryGetPokerGame(tableId, userId, out var pokerGame)) return;

        if (!message.TryGetProperty("amount", out var amountProp) || !amountProp.TryGetInt32(out int amount))
        {
            Console.WriteLine($"❌ Apuesta inválida recibida.");
            await SendErrorAsync(userId, "Monto de apuesta inválido.");
            return;
        }

        if (!message.TryGetProperty("phase", out var phaseProp))
        {
            Console.WriteLine("❌ Fase no especificada en el mensaje.");
            await SendErrorAsync(userId, "Fase no especificada.");
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
            Console.WriteLine($"❌ Error al procesar la apuesta: {ex.Message}");
            await SendErrorAsync(userId, ex.Message);
            return;
        }

        await PokerManager.RegisterAndMaybeAdvancePhaseAsync(
            tableId,
            match,
            player,
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
                suit = (int)c.Suit,
                rank = (int)c.Rank
            }).ToList()
        };

        List<string> userIds = match.Players
            .Where(p => p.PlayerState != PlayerState.Spectating)
            .Select(p => p.UserId.ToString())
            .ToList();

        await ((IWebSocketSender)this).BroadcastToUsersAsync(userIds, response);

        PokerActionTracker.Clear(tableId, phase);

        Console.WriteLine($"🃏 [{phase.ToUpper()}] Repartido en mesa {tableId}. Acción: {actionName}");
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
            cards = pokerGame.GetCommunityCards().Select(c => new { c.Suit, c.Rank }).ToList()
        };

        List<string> userIds = match.Players
            .Where(p => p.PlayerState != PlayerState.Spectating)
            .Select(p => p.UserId.ToString())
            .ToList();

        await ((IWebSocketSender)this).BroadcastToUsersAsync(userIds, response);

        PokerActionTracker.Clear(tableId, "flop");

        Console.WriteLine($"🃏 [PokerWS] Flop repartido en mesa {tableId}, esperando apuestas.");
    }

    private async Task HandleDealTurnAsync(JsonElement message)
    {
        if (!TryGetTableId(message, out var tableId)) return;
        if (!TryGetPokerGame(tableId, "system", out var pokerGame)) return;
        if (!TryGetMatch(tableId, "system", out var match)) return;

        pokerGame.DealTurn();
        pokerGame.StartTurn("turn");

        List<Card> communityCards = pokerGame.GetCommunityCards();

        Console.WriteLine("\n--- TURN ---");
        PokerHelper.ShowCommunityCards(communityCards);

        var response = new
        {
            type = Type,
            action = "turn_dealt",
            cards = communityCards.Select(c => new
            {
                suit = (int)c.Suit,
                rank = (int)c.Rank
            }).ToList()
        };

        List<string> userIds = match.Players
            .Where(p => p.PlayerState != PlayerState.Spectating)
            .Select(p => p.UserId.ToString())
            .ToList();

        await ((IWebSocketSender)this).BroadcastToUsersAsync(userIds, response);

        PokerActionTracker.Clear(tableId, "turn");

        Console.WriteLine($"🃏 [PokerWS] Turn repartido en mesa {tableId}, esperando apuestas.");
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
            cards = communityCards.Select(c => new { c.Suit, c.Rank }).ToList()
        };

        List<string> playerIds = match.Players
            .Where(p => p.PlayerState != PlayerState.Spectating)
            .Select(p => p.UserId.ToString())
            .ToList();
        
        await ((IWebSocketSender)this).BroadcastToUsersAsync(playerIds, response);

        PokerActionTracker.Clear(tableId, "river");

        Console.WriteLine($"🃏 [PokerWS] River repartido en mesa {tableId}, esperando apuestas.");
    }

    private async Task HandleShowdownAsync(int tableId)
    {
        if (!TryGetPokerGame(tableId, out var pokerGame)) return;
        if (!TryGetMatch(tableId, out var match)) return;

        pokerGame.GeneratePots();
        pokerGame.Showdown();

        UnitOfWork unitOfWork = GetScopedService<UnitOfWork>(out var coinsScope);
        using (coinsScope)
        {
            foreach (var player in match.Players)
            {
                if (player.PlayerState is PlayerState.Playing or PlayerState.AllIn or PlayerState.Win)
                {
                    await PokerManager.UpdatePlayerCoinsAsync(unitOfWork, player);
                }
            }
        }

        var summary = pokerGame.GetShowdownSummary();
        var response = new
        {
            type = Type, 
            action = "round_result",
            summary
        };

        List<string> userIds = match.Players
            .Where(p => p.PlayerState != PlayerState.Spectating)
            .Select(p => p.UserId.ToString())
            .ToList();

        await ((IWebSocketSender)this).BroadcastToUsersAsync(userIds, response);

        // ⏱️ Esperar 20 segundos antes de cerrar el match
        Console.WriteLine("⏱️ Iniciando temporizador de fin de ronda...");

        if (ActiveGameSessionStore.TryGet(tableId, out var session))
        {
            session.StartPostMatchTimer(20_000, async () =>
            {
                var gameMatchWS = GetScopedService<GameMatchWS>(out var scope);
                using (scope)
                {
                    Console.WriteLine($"🧾 [GameMatchWS] EndMatchForAllPlayersAsync llamado para mesa {tableId} (desde temporizador)");
                    await gameMatchWS.FinalizeAndEvaluateMatchAsync(tableId);
                    pokerGame.ResetCurrentBets();
                    PokerBetTracker.ResetContributions(tableId);
                }
            });
        }
    }


    private async Task HandleBetAndNotifyAsync(Player player)
    {
        UnitOfWork unitOfWork = GetScopedService<UnitOfWork>(out var scope);
        PokerNotifier notifier = _serviceProvider.GetRequiredService<PokerNotifier>();

        using (scope)
        {
            await PokerManager.UpdatePlayerCoinsAsync(unitOfWork, player);
        }
        await notifier.NotifyBetConfirmedAsync(player);

        Console.WriteLine($"✅ Apuesta confirmada. {player.User.NickName} tiene ahora {player.User.Coins} fichas.");
    }

    private bool TryGetPokerGame(int tableId, out PokerGame pokerGame)
    => TryGetWithError(ActivePokerGameStore.TryGetNullable, tableId, out pokerGame, "partida de Poker");

    private bool TryGetPokerGame(int tableId, string? userId, out PokerGame pokerGame)
        => TryGetWithError(ActivePokerGameStore.TryGetNullable, tableId, out pokerGame, "partida de Poker", userId);

    private async Task NotifyNextTurnAsync(int tableId, PokerGame pokerGame, Match match, string phase, PokerNotifier notifier)
    {
        Console.WriteLine($"🔁 Llamando a AdvanceTurn() desde fase {phase}");
        pokerGame.AdvanceTurn();

        int nextUserId = pokerGame.CurrentTurnUserId;

        Player? nextPlayer = match.Players.FirstOrDefault(p => p.UserId == nextUserId);

        if (nextPlayer == null) return;

        if (!PokerActionTracker.HasPlayerActed(tableId, nextPlayer.UserId, phase))
        {
            await notifier.NotifyPlayerTurnAsync(match, nextPlayer);
        }
    }

}