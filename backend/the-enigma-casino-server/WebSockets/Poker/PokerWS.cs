using System.Text.Json;
using the_enigma_casino_server.Games.Poker;
using the_enigma_casino_server.Games.Shared.Entities;
using the_enigma_casino_server.Games.Shared.Enum;
using the_enigma_casino_server.Infrastructure.Database;
using the_enigma_casino_server.Websockets.Poker;
using the_enigma_casino_server.WebSockets.Base;
using the_enigma_casino_server.WebSockets.GameMatch;
using the_enigma_casino_server.WebSockets.GameMatch.Store;
using the_enigma_casino_server.WebSockets.Interfaces;
using the_enigma_casino_server.WebSockets.Poker.Store;
using the_enigma_casino_server.WebSockets.Resolvers;


namespace the_enigma_casino_server.WebSockets.Poker;

public class PokerWS : BaseWebSocketHandler, IWebSocketMessageHandler
{
    public string Type => "poker";


    public PokerWS(ConnectionManagerWS connectionManager, IServiceProvider serviceProvider)
        : base(connectionManager, serviceProvider)
    {
        connectionManager.OnUserDisconnected += HandleUserDisconnection;
    }

    public async Task HandleAsync(string userId, JsonElement message)
    {
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
                PokerMessageType.Showdown => HandleShowdownAsync(message),
                _ => Task.CompletedTask
            });
        }
    }

    public async Task StartInitialDealAsync(Match match)
    {
        int tableId = match.GameTableId;

        PokerNotifier notifier = _serviceProvider.GetRequiredService<PokerNotifier>();

        PokerGameService pokerGame = await PokerManager.StartNewRound(match, _serviceProvider);

        await notifier.NotifyBlindsAsync(match, pokerGame);
        Console.WriteLine($"🃏 [PokerWS] Cartas iniciales repartidas en mesa {tableId}.");

        await notifier.SendInitialHandsAsync(match);
        Console.WriteLine("✅ [PokerWS] Cartas iniciales enviadas a todos los jugadores.");

        await notifier.NotifyStartBettingAsync(match);
        Console.WriteLine("♠️ [PokerWS] Fase de apuestas pre-flop iniciada.");

        int firstTurnUserId = pokerGame.CurrentTurnUserId;
        Player? firstPlayer = match.Players.FirstOrDefault(p => p.UserId == firstTurnUserId);

        if (firstPlayer != null)
        {
            await notifier.NotifyPlayerTurnAsync(match, firstPlayer);
        }
    }

    private async Task HandlePlayerActionAsync(string userId, JsonElement message)
    {
        if (!TryGetTableId(message, out var tableId)) return;
        if (!TryGetMatch(tableId, userId, out var match)) return;
        if (!TryGetPlayer(match, userId, out var player)) return;
        if (!TryGetPokerGame(tableId, userId, out var pokerGame)) return;

        PokerTurnService turnService = GetScopedService<PokerTurnService>(out var turnScope);
        PokerNotifier notifier = _serviceProvider.GetRequiredService<PokerNotifier>();

        using (turnScope)
        {
            if (!turnService.IsPlayerTurn(match, player.UserId))
            {
                await SendErrorAsync(userId, "No es tu turno.");
                return;
            }
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
            {
                await HandleBetAndNotifyAsync(player);

            }

            await notifier.NotifyPlayerActionAsync(player, move);

            if (shouldAdvance)
            {
                pokerGame.AdvanceTurn();
                int nextUserId = pokerGame.CurrentTurnUserId;

                Player? nextPlayer = match.Players.FirstOrDefault(p => p.UserId == nextUserId);
                if (nextPlayer != null)
                {
                    await notifier.NotifyPlayerTurnAsync(match, nextPlayer);
                }
            }
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

        pokerGame.StartTurn(match);

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

        List<string> userIds = match.Players.Select(p => p.UserId.ToString()).ToList();
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
                await HandleShowdownAsync(JsonDocument.Parse($"{{\"tableId\":\"{tableId}\"}}").RootElement);
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
        pokerGame.StartTurn(match);

        var response = new
        {
            type = Type,
            action = "flop_dealt",
            cards = pokerGame.GetCommunityCards().Select(c => new { c.Suit, c.Rank }).ToList()
        };

        List<string> playerIds = match.Players.Select(p => p.UserId.ToString()).ToList();
        await ((IWebSocketSender)this).BroadcastToUsersAsync(playerIds, response);

        PokerActionTracker.Clear(tableId, "flop");

        Console.WriteLine($"🃏 [PokerWS] Flop repartido en mesa {tableId}, esperando apuestas.");
    }



    private async Task HandleDealTurnAsync(JsonElement message)
    {
        if (!TryGetTableId(message, out var tableId)) return;
        if (!TryGetPokerGame(tableId, "system", out var pokerGame)) return;
        if (!TryGetMatch(tableId, "system", out var match)) return;

        pokerGame.DealTurn();
        pokerGame.StartTurn(match);

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

        IEnumerable<string> allUserIds = match.Players.Select(p => p.UserId.ToString());
        await ((IWebSocketSender)this).BroadcastToUsersAsync(allUserIds, response);

        PokerActionTracker.Clear(tableId, "turn");

        Console.WriteLine($"🃏 [PokerWS] Turn repartido en mesa {tableId}, esperando apuestas.");
    }

    private async Task HandleDealRiverAsync(JsonElement message)
    {
        if (!TryGetTableId(message, out int tableId)) return;
        if (!TryGetPokerGame(tableId, "system", out var pokerGame)) return;
        if (!TryGetMatch(tableId, "system", out var match)) return;

        pokerGame.DealRiver();
        pokerGame.StartTurn(match);

        List<Card> communityCards = pokerGame.GetCommunityCards();

        var response = new
        {
            type = Type,
            action = "river_dealt",
            cards = communityCards.Select(c => new { c.Suit, c.Rank }).ToList()
        };

        List<string> playerIds = match.Players.Select(p => p.UserId.ToString()).ToList();
        await ((IWebSocketSender)this).BroadcastToUsersAsync(playerIds, response);

        PokerActionTracker.Clear(tableId, "river");

        Console.WriteLine($"🃏 [PokerWS] River repartido en mesa {tableId}, esperando apuestas.");
    }

    private async Task HandleShowdownAsync(JsonElement message)
    {
        if (!TryGetTableId(message, out int tableId)) return;

        if (!TryGetPokerGame(tableId, "system", out var pokerGame)) return;

        pokerGame.GeneratePots();
        pokerGame.Showdown();

        var summary = pokerGame.GetShowdownSummary();

        UnitOfWork unitOfWork = GetScopedService<UnitOfWork>(out var coinsScope);
        using (coinsScope)
        {
            foreach (var player in pokerGame.GameMatch.Players)
            {
                if (player.PlayerState is PlayerState.Playing or PlayerState.AllIn or PlayerState.Win)

                {
                    await PokerManager.UpdatePlayerCoinsAsync(unitOfWork, player);
                }
            }
        }

        var response = new
        {
            type = Type,
            action = "showdown_result",
            winners = summary
        };

        var playerIds = pokerGame.GameMatch.Players.Select(p => p.UserId.ToString()).ToList();
        await ((IWebSocketSender)this).BroadcastToUsersAsync(playerIds, response);

        if (TryGetMatch(tableId, "system", out var match))
        {
            GameMatchManager matchManager = GetScopedService<GameMatchManager>(out var matchScope);
            using (matchScope)
            {
                await matchManager.EndMatchAsync(match);
            }
        }

        Console.WriteLine($"🧾 [PokerWS] Match finalizado tras Showdown en la mesa {tableId}.");
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

    private bool TryGetPokerGame(int tableId, string userId, out PokerGameService pokerGame)
    {

        if (!ActivePokerGameStore.TryGet(tableId, out pokerGame))
        {
            Console.WriteLine($"❌ [PokerWS] No hay PokerGame activo para mesa {tableId}");
            _ = SendErrorAsync(userId, "No hay partida activa de Poker en esta mesa.");
            return false;
        }

        return true;
    }

    private async void HandleUserDisconnection(string userId)
    {
        if (!int.TryParse(userId, out int userIdInt))
            return;

        foreach (var (tableId, match) in ActiveGameMatchStore.GetAll())
        {
            if (match.Players.Any(p => p.UserId == userIdInt))
            {
                Console.WriteLine($"🔌 [PokerWS] Usuario {userIdInt} desconectado de la mesa {tableId}");

                GameMatchManager matchManager = GetScopedService<GameMatchManager>(out var scope);
                using (scope)
                {
                    GameTurnServiceResolver turnResolver = scope.ServiceProvider.GetRequiredService<GameTurnServiceResolver>();
                    IGameTurnService turnService = turnResolver.Resolve(match.GameTable.GameType);

                    Player? player = match.Players.FirstOrDefault(p => p.UserId == userIdInt);
                    if (player == null)
                    {
                        Console.WriteLine($"⚠️ [PokerWS] Jugador {userIdInt} no encontrado en la mesa {tableId}");
                        return;
                    }

                    await Task.Delay(10000);

                    if (!_connectionManager.TryGetConnection(userId, out _))
                    {
                        Console.WriteLine($"⏱️ Usuario {userIdInt} sigue desconectado tras 10s. Saliendo del match.");
                        await matchManager.HandlePlayerExitAsync(player, match, tableId, turnService);
                    }
                }

                break;
            }
        }
    }

}