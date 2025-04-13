using System.Text.Json;
using System.Text.RegularExpressions;
using the_enigma_casino_server.Games.Poker;
using the_enigma_casino_server.Games.Shared.Entities;
using the_enigma_casino_server.Games.Shared.Enum;
using the_enigma_casino_server.Infrastructure.Database;
using the_enigma_casino_server.WebSockets.Base;
using the_enigma_casino_server.WebSockets.GameMatch;
using the_enigma_casino_server.WebSockets.GameMatch.Store;
using the_enigma_casino_server.WebSockets.Interfaces;
using the_enigma_casino_server.WebSockets.Poker.Store;
using Match = the_enigma_casino_server.Games.Shared.Entities.Match;


namespace the_enigma_casino_server.WebSockets.Poker;

public class PokerWS : BaseWebSocketHandler, IWebSocketMessageHandler
{
    public string Type => "poker";

    private readonly GameMatchManager _gameMatchManager;


    public PokerWS(ConnectionManagerWS connectionManager, IServiceProvider serviceProvider)
        : base(connectionManager, serviceProvider)
    {
        _gameMatchManager = serviceProvider.GetRequiredService<GameMatchManager>();
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

    //private Task HandlePlaceBetAsync(string userId, JsonElement message) => Task.CompletedTask;
    private Task HandlePlayerActionAsync(string userId, JsonElement message) => Task.CompletedTask;
    //private Task HandleDealFlopAsync(JsonElement message) => Task.CompletedTask;
    //private Task HandleDealTurnAsync(JsonElement message) => Task.CompletedTask;
    //private Task HandleDealRiverAsync(JsonElement message) => Task.CompletedTask;
    //private Task HandleShowdownAsync(JsonElement message) => Task.CompletedTask;

    private async Task HandlePlaceBetAsync(string userId, JsonElement message)
    {
        Console.WriteLine("🎯 [PokerWS] Entrando a HandlePlaceBetAsync");

        if (!TryGetTableId(message, out var tableId)) return;
        if (!TryGetMatch(tableId, userId, out var match)) return;
        if (!TryGetPlayer(match, userId, out var player)) return;

        if (player.CurrentBet > 0)
        {
            Console.WriteLine($"⛔ El jugador {userId} ya ha apostado en esta ronda.");
            await SendErrorAsync(userId, "Ya has apostado en esta ronda.");
            return;
        }

        int amount = message.GetProperty("amount").GetInt32();
        Console.WriteLine($"🪙 Usuario {userId} apuesta {amount} en mesa {tableId}");

        if (amount < 10 || amount > 10000)
        {
            await SendErrorAsync(userId, "La apuesta debe estar entre 10 y 10000.");
            return;
        }

        try
        {
            player.PlaceBet(amount);
            UnitOfWork unitOfWork = GetScopedService<UnitOfWork>(out var scope);
            using (scope)
            {
                unitOfWork.UserRepository.Update(player.User);
                await unitOfWork.SaveAsync();
            }
            Console.WriteLine($"✅ {player.User.NickName} apostó {amount}. Fichas restantes: {player.User.Coins}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Error al apostar: {ex.Message}");
            await SendErrorAsync(userId, ex.Message);
            return;
        }

        var response = new
        {
            type = Type,
            action = "bet_confirmed",
            userId = player.UserId,
            nickname = player.User.NickName,
            remainingCoins = player.User.Coins,
            bet = player.CurrentBet
        };

        await ((IWebSocketSender)this).SendToUserAsync(userId, response);

        PokerActionTracker.RegisterAction(tableId, player.UserId, "preflop");

        List<int> expectedIds = match.Players
            .Where(p => p.PlayerState == PlayerState.Playing || p.PlayerState == PlayerState.AllIn)
            .Select(p => p.UserId)
            .ToList();

        Console.WriteLine($"🧾 Esperados: {string.Join(", ", expectedIds)}");
        Console.WriteLine($"🎲 Ya apostaron: {string.Join(", ", PokerActionTracker.GetAllForTable(tableId, "preflop"))}");

        if (PokerActionTracker.HaveAllPlayersActed(tableId, expectedIds, "preflop"))
        {
            PokerActionTracker.Clear(tableId, "preflop");
            Console.WriteLine($"✅ Todos han apostado en mesa {tableId}. Repartiendo FLOP...");
            await HandleDealFlopAsync(message);
        }
    }

    private async Task HandleDealFlopAsync(JsonElement message)
    {
        if (!TryGetTableId(message, out int tableId)) return;

        if (!TryGetPokerGame(tableId, "system", out var pokerGame)) return;

        pokerGame.DealFlop();

        List<Card> communityCards = pokerGame.GetCommunityCards();

        var response = new
        {
            type = Type,
            action = "flop_dealt",
            cards = communityCards.Select(c => new { c.Suit, c.Rank }).ToList()
        };

        IEnumerable<string> playerIds = pokerGame.GetActivePlayers().Select(p => p.UserId.ToString());
        await ((IWebSocketSender)this).BroadcastToUsersAsync(playerIds, response);
    }

    private async Task HandleDealTurnAsync(JsonElement message)
    {
        if (!TryGetTableId(message, out int tableId)) return;

        if (!TryGetPokerGame(tableId, "system", out var pokerGame)) return;

        pokerGame.DealTurn();

        List<Card> communityCards = pokerGame.GetCommunityCards();

        var response = new
        {
            type = Type,
            action = "turn_dealt",
            cards = communityCards.Select(c => new { c.Suit, c.Rank }).ToList()
        };

        List<string> playerIds = pokerGame.GetActivePlayers()
            .Select(p => p.UserId.ToString())
            .ToList();

        await ((IWebSocketSender)this).BroadcastToUsersAsync(playerIds, response);
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
            await _gameMatchManager.EndMatchAsync(match);
        }


        Console.WriteLine($"✅ [PokerWS] Showdown completado en la mesa {tableId}.");
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
