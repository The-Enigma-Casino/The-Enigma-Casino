using System.Text.Json;
using the_enigma_casino_server.Games.Poker;
using the_enigma_casino_server.Games.Shared.Entities;
using the_enigma_casino_server.Games.Shared.Enum;
using the_enigma_casino_server.Infrastructure.Database;
using the_enigma_casino_server.WebSockets.Base;
using the_enigma_casino_server.WebSockets.GameMatch;
using the_enigma_casino_server.WebSockets.GameMatch.Store;
using the_enigma_casino_server.WebSockets.GameTable.Store;
using the_enigma_casino_server.WebSockets.Interfaces;
using the_enigma_casino_server.WebSockets.Poker.Store;
using Match = the_enigma_casino_server.Games.Shared.Entities.Match;


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

        PokerGameService pokerGame = new PokerGameService(match);
        pokerGame.StartRound();
        pokerGame.AssignBlinds();

        ActivePokerGameStore.Set(tableId, pokerGame);

        Player smallBlind = pokerGame.GetSmallBlind();
        Player bigBlind = pokerGame.GetBigBlind();
        Player dealer = pokerGame.GetDealer();

        var blindInfo = new
        {
            type = Type,
            action = "blinds_assigned",
            dealer = new { userId = dealer.UserId },
            smallBlind = new { userId = smallBlind.UserId, amount = smallBlind.CurrentBet },
            bigBlind = new { userId = bigBlind.UserId, amount = bigBlind.CurrentBet }
        };

        var playerIds = match.Players.Select(p => p.UserId.ToString()).ToList();
        await ((IWebSocketSender)this).BroadcastToUsersAsync(playerIds, blindInfo);


        Console.WriteLine($"🃏 [PokerWS] Cartas iniciales repartidas en mesa {tableId}.");

        foreach (Player player in match.Players.Where(p => p.PlayerState == PlayerState.Playing))
        {
            var personalHand = player.Hand.Cards.Select(c => new
            {
                rank = c.Rank.ToString(),
                suit = c.Suit.ToString(),
                value = c.Value
            }).ToList();

            var response = new
            {
                type = Type,
                action = "initial_hand",
                userId = player.UserId,
                cards = personalHand
            };

            await ((IWebSocketSender)this).SendToUserAsync(player.UserId.ToString(), response);
        }

        Console.WriteLine("✅ [PokerWS] Cartas iniciales enviadas a todos los jugadores.");

        var startBetting = new
        {
            type = Type,
            action = "start_betting",
            phase = "preflop"
        };

        await ((IWebSocketSender)this).BroadcastToUsersAsync(playerIds, startBetting);

        Console.WriteLine("♠️ [PokerWS] Fase de apuestas pre-flop iniciada.");


    }

    private async Task HandlePlaceBetAsync(string userId, JsonElement message)
    {
        Console.WriteLine("🎯 Entrando en HandlePlaceBetAsync");

        if (!TryGetTableId(message, out int tableId)) return;

        if (!ActivePokerGameStore.TryGet(tableId, out var pokerGameService))
        {
            Console.WriteLine($"❌ No se encontró PokerGame activo para la mesa {tableId}");
            await SendErrorAsync(userId, "No hay partida activa en esta mesa.");
            return;
        }

        if (!TryGetMatch(tableId, userId, out var match)) return;

        if (!TryGetPlayer(match, userId, out var player)) return;

        if (!message.TryGetProperty("amount", out var amountProp) || !amountProp.TryGetInt32(out int amount))
        {
            Console.WriteLine($"❌ Apuesta inválida recibida.");
            await SendErrorAsync(userId, "Monto de apuesta inválido.");
            return;
        }

        Console.WriteLine($"🪙 {player.User.NickName} ({player.UserId}) intenta apostar {amount} fichas.");

        try
        {
            pokerGameService.HandlePokerBet(player, amount);

            var unitOfWork = GetScopedService<UnitOfWork>(out var scope);
            using (scope)
            {
                unitOfWork.UserRepository.Update(player.User);
                await unitOfWork.SaveAsync();
            }

            Console.WriteLine($"✅ Apuesta registrada. {player.User.NickName} tiene ahora {player.User.Coins} fichas.");

            var response = new
            {
                type = "poker",
                action = "bet_confirmed",
                userId = player.UserId,
                nickname = player.User.NickName,
                remainingCoins = player.User.Coins,
                bet = player.CurrentBet
            };

            await ((IWebSocketSender)this).SendToUserAsync(userId, response);

            if (!message.TryGetProperty("phase", out var phaseProp))
            {
                Console.WriteLine("❌ Fase no especificada en el mensaje.");
                return;
            }

            string phase = phaseProp.GetString()!;
            PokerActionTracker.RegisterAction(tableId, player.UserId, phase);
            Console.WriteLine($"✅ Acción registrada para {player.User.NickName} en fase {phase}.");

            var expectedPlayerIds = match.Players
                .Where(p => p.PlayerState == PlayerState.Playing || p.PlayerState == PlayerState.AllIn)
                .Select(p => p.UserId)
                .ToList();

            if (PokerActionTracker.HaveAllPlayersActed(tableId, expectedPlayerIds, phase))
            {
                PokerActionTracker.Clear(tableId, phase);
                Console.WriteLine($"🚀 Todos los jugadores han actuado en la fase {phase}.");

                await HandlePhaseAdvanceAsync(tableId, phase);
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Error al procesar la apuesta: {ex.Message}");
            await SendErrorAsync(userId, ex.Message);
        }
    }

    private async Task HandlePhaseAdvanceAsync(int tableId, string phase)
    {
        if (!ActivePokerGameStore.TryGet(tableId, out var pokerGame))
        {
            Console.WriteLine($"❌ No se encontró PokerGame para avanzar la fase.");
            return;
        }

        switch (phase)
        {
            case "preflop":
                await HandleDealFlopAsync(JsonDocument.Parse($"{{\"tableId\":\"{tableId}\"}}").RootElement);
                break;

            case "flop":
                await HandleDealTurnAsync(JsonDocument.Parse($"{{\"tableId\":\"{tableId}\"}}").RootElement);
                break;

            case "turn":
                await HandleDealRiverAsync(JsonDocument.Parse($"{{\"tableId\":\"{tableId}\"}}").RootElement);
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

        pokerGame.DealFlop();

        var communityCards = pokerGame.GetCommunityCards();

        var response = new
        {
            type = Type,
            action = "flop_dealt",
            cards = communityCards.Select(c => new { c.Suit, c.Rank }).ToList()
        };

        var playerIds = pokerGame.GetActivePlayers()
            .Select(p => p.UserId.ToString())
            .ToList();

        await ((IWebSocketSender)this).BroadcastToUsersAsync(playerIds, response);

        PokerActionTracker.Clear(tableId, "flop");

        Console.WriteLine($"🃏 [PokerWS] Flop repartido en mesa {tableId}, esperando apuestas.");
    }


    private async Task HandleDealTurnAsync(JsonElement message)
    {
        if (!TryGetTableId(message, out var tableId)) return;
        if (!TryGetMatch(tableId, null, out var match)) return;
        if (!TryGetPokerGame(tableId, null, out var pokerGame)) return;

        pokerGame.DealTurn();
        pokerGame.StartTurn(match);

        var communityCards = pokerGame.GetCommunityCards();

        Console.WriteLine("\n--- TURN D ---");
        Console.WriteLine("Cartas comunitarias:");
        foreach (var card in communityCards)
            Console.WriteLine(card);

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

        var userIds = match.Players.Select(p => p.UserId.ToString());
        await ((IWebSocketSender)this).BroadcastToUsersAsync(userIds, response);

        Console.WriteLine($"🃏 [PokerWS] Turn repartido en mesa {tableId}, esperando apuestas.");
    }



    private async Task HandleDealRiverAsync(JsonElement message)
    {
        if (!TryGetTableId(message, out int tableId)) return;

        if (!TryGetPokerGame(tableId, "system", out var pokerGame)) return;

        pokerGame.DealRiver();

        List<Card> communityCards = pokerGame.GetCommunityCards();

        var response = new
        {
            type = Type,
            action = "river_dealt",
            cards = communityCards.Select(c => new { c.Suit, c.Rank }).ToList()
        };

        List<string> playerIds = pokerGame.GetActivePlayers()
            .Select(p => p.UserId.ToString())
            .ToList();

        await ((IWebSocketSender)this).BroadcastToUsersAsync(playerIds, response);
    }


    private async Task HandleShowdownAsync(JsonElement message)
    {
        if (!TryGetTableId(message, out int tableId)) return;
        if (!TryGetPokerGame(tableId, "system", out var pokerGame)) return;

        pokerGame.Showdown();

        List<string> playerIds = pokerGame.GetActivePlayers()
            .Select(p => p.UserId.ToString())
            .ToList();

        var response = new
        {
            type = Type,
            action = "showdown_done"
        };

        await ((IWebSocketSender)this).BroadcastToUsersAsync(playerIds, response);

        if (TryGetMatch(tableId, "system", out var match))
        {
            var matchManager = GetScopedService<GameMatchManager>(out var scope);
            using (scope)
            {
                await matchManager.EndMatchAsync(match);
            }
        }

        Console.WriteLine($"🧾 [PokerWS] Match finalizado tras Showdown en la mesa {tableId}.");

        if (ActiveGameSessionStore.TryGet(tableId, out var session))
        {
            var table = session.Table;
            var remainingPlayers = table.Players
                .Where(p => p.PlayerState == PlayerState.Playing || p.PlayerState == PlayerState.AllIn)
                .ToList();

            if (remainingPlayers.Count >= table.MinPlayer)
            {
                Console.WriteLine($"♻️ [PokerWS] Hay jugadores suficientes. Iniciando nuevo Match...");

                var matchManager = GetScopedService<GameMatchManager>(out var newScope);
                using (newScope)
                {
                    Match newMatch = await matchManager.StartMatchAsync(table);
                    Console.WriteLine($"✅ [PokerWS] Nuevo Match creado correctamente en mesa {table.Id}.");
                }
            }
            else
            {
                Console.WriteLine($"⛔ [PokerWS] No hay suficientes jugadores para un nuevo Match en mesa {table.Id}.");
            }
        }
    }



    private async Task HandlePlayerActionAsync(string userId, JsonElement message)
    {
        if (!TryGetTableId(message, out var tableId)) return;
        if (!TryGetMatch(tableId, userId, out var match)) return;
        if (!TryGetPlayer(match, userId, out var player)) return;
        if (!TryGetPokerGame(tableId, userId, out var pokerGame)) return;

        if (!message.TryGetProperty("move", out var moveProp))
        {
            await SendErrorAsync(userId, "Falta la acción (move).");
            return;
        }

        string move = moveProp.GetString()?.ToLower() ?? "";
        int amount = 0;

        if (message.TryGetProperty("amount", out var amountProp))
            amount = amountProp.GetInt32();

        Console.WriteLine($"🎮 [PokerWS] {player.User.NickName} realiza acción '{move}' en mesa {tableId}");

        string phase = pokerGame.GetCommunityCards().Count switch
        {
            0 => "preflop",
            3 => "flop",
            4 => "turn",
            5 => "river",
            _ => "unknown"
        };

        switch (move)
        {
            case "check":
                if (player.CurrentBet < match.Players.Max(p => p.CurrentBet))
                {
                    await SendErrorAsync(userId, "No puedes hacer check, hay una apuesta activa.");
                    return;
                }
                Console.WriteLine($"{player.User.NickName} hace check.");
                break;
            case "call":
                int toCall = match.Players.Max(p => p.CurrentBet) - player.CurrentBet;

                if (toCall <= 0)
                {
                    await SendErrorAsync(userId, "No tienes nada que igualar.");
                    return;
                }

                if (toCall > player.User.Coins)
                {
                    toCall = player.User.Coins;
                }

                pokerGame.HandlePokerBet(player, toCall);
                break;
            case "raise":
                if (amount <= 0 || amount > player.User.Coins)
                {
                    await SendErrorAsync(userId, "Cantidad de raise no válida.");
                    return;
                }

                int currentMax = match.Players.Max(p => p.CurrentBet);
                int totalBet = (currentMax - player.CurrentBet) + amount;

                if (totalBet > player.User.Coins)
                {
                    await SendErrorAsync(userId, "No tienes suficientes fichas para hacer raise.");
                    return;
                }

                pokerGame.HandlePokerBet(player, totalBet);

                var activePlayerIds = match.Players
                    .Where(p => p.PlayerState == PlayerState.Playing || p.PlayerState == PlayerState.AllIn)
                    .Select(p => p.UserId)
                    .ToList();


                PokerActionTracker.ResetActionsForRaise(tableId, activePlayerIds, player.UserId, phase);
                break;

            case "all-in":
                pokerGame.HandlePokerBet(player, player.User.Coins);
                break;

            case "fold":
                player.PlayerState = PlayerState.Fold;
                Console.WriteLine($"{player.User.NickName} se retira.");
                break;

            default:
                await SendErrorAsync(userId, "Acción no reconocida.");
                return;
        }

        var broadcast = new
        {
            type = Type,
            action = "player_action",
            userId = player.UserId,
            move,
            amount = player.CurrentBet
        };

        var allUserIds = match.Players.Select(p => p.UserId.ToString());
        await ((IWebSocketSender)this).BroadcastToUsersAsync(allUserIds, broadcast);

        if (move != "fold")
        {
            pokerGame.AdvanceTurn();
        }

        PokerActionTracker.RegisterAction(tableId, player.UserId, phase);

        var expectedIds = match.Players
            .Where(p => p.PlayerState == PlayerState.Playing || p.PlayerState == PlayerState.AllIn)
            .Select(p => p.UserId)
            .ToList();

        if (PokerActionTracker.HaveAllPlayersActed(tableId, expectedIds, phase))
        {
            PokerActionTracker.Clear(tableId, phase);
            Console.WriteLine($"✅ Todos los jugadores han actuado en fase '{phase}'.");

            switch (phase)
            {
                case "preflop":
                    await HandleDealFlopAsync(message);
                    break;
                case "flop":
                    await HandleDealTurnAsync(message);
                    break;
                case "turn":
                    await HandleDealRiverAsync(message);
                    break;
                case "river":
                    await HandleShowdownAsync(message);
                    break;
            }
        }
    }


    private bool TryGetTableId(JsonElement message, out int tableId)
    {
        tableId = 0;
        if (!message.TryGetProperty("tableId", out var tableIdProp) ||
            !int.TryParse(tableIdProp.GetString(), out tableId))
        {
            Console.WriteLine("❌ [PokerWS] TableId inválido.");
            return false;
        }
        return true;
    }

    private bool TryGetMatch(int tableId, string userId, out Match match)
    {
        if (!ActiveGameMatchStore.TryGet(tableId, out match))
        {
            Console.WriteLine($"❌ [PokerWS] No se encontró Match en la mesa {tableId}");
            _ = SendErrorAsync(userId, "No hay un match activo en esta mesa.");
            return false;
        }
        return true;
    }

    private bool TryGetPlayer(Match match, string userId, out Player player)
    {
        player = match.Players.FirstOrDefault(p => p.UserId.ToString() == userId);
        if (player == null)
        {
            Console.WriteLine($"❌ [PokerWS] Jugador {userId} no encontrado en Match.");
            _ = SendErrorAsync(userId, "Jugador no encontrado en la mesa.");
            return false;
        }
        return true;
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

}
