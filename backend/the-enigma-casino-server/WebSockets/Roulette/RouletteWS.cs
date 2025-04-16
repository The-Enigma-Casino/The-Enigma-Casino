using Org.BouncyCastle.Bcpg;
using System.Text.Json;
using the_enigma_casino_server.Core.Entities;
using the_enigma_casino_server.Games.BlackJack;
using the_enigma_casino_server.Games.Roulette;
using the_enigma_casino_server.Games.Roulette.Enums;
using the_enigma_casino_server.Games.Shared.Entities;
using the_enigma_casino_server.Infrastructure.Database;
using the_enigma_casino_server.WebSockets.Base;
using the_enigma_casino_server.WebSockets.BlackJack;
using the_enigma_casino_server.WebSockets.GameMatch.Store;
using the_enigma_casino_server.WebSockets.Interfaces;

namespace the_enigma_casino_server.Websockets.Roulette;

public class RouletteWS : BaseWebSocketHandler, IWebSocketMessageHandler, IGameTurnService
{
    public string Type => "roulette";

    public RouletteWS(ConnectionManagerWS connectionManagerWS, IServiceProvider serviceProvider) : base(connectionManagerWS, serviceProvider) { }


    public async Task HandleAsync(string userId, JsonElement message)
    {
        if (message.TryGetProperty("action", out JsonElement actionProp))
        {
            string action = actionProp.GetString();
            await (action switch
            {
                RouletteMessageType.PlaceBet => HandlePlaceBetAsync(userId, message),
                RouletteMessageType.Spin => HandleSpinAsync(userId, message),
                _ => Task.CompletedTask
            });

        }
    }

    private static readonly SemaphoreSlim _betLock = new(1, 1); // Bloqueo solo 1 pasa, por turnos
    private async Task HandlePlaceBetAsync(string userId, JsonElement message)
    {
        Console.WriteLine("Entrando en HandlePlaceBetAsync");

        if (!TryGetTableId(message, out int tableId)) return;

        if (!TryGetMatch(tableId, userId, out var match)) return;

        if (!TryGetPlayer(match, userId, out var player)) return;

        if (!TryGetRouletteGame(tableId, userId, out var rouletteGame)) return;

        try
        {
            await _betLock.WaitAsync();

            var bet = BuildRouletteBet(message);
            Console.WriteLine($"Usuario {player.User.NickName} apuesta {bet.Amount} a {bet}");

            rouletteGame.RegisterBet(player, bet);

            UnitOfWork unitOfWork = GetScopedService<UnitOfWork>(out var scope);
            await unitOfWork.SaveAsync();

            var response = new
            {
                type = Type,
                action = "bet_confirmed",
                userId,
                nickname = player.User.NickName,
                bet = bet.ToString(),
                amount = bet.Amount,
                remainingCoins = player.User.Coins
            };

            await ((IWebSocketSender)this).SendToUserAsync(userId, response);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error en apuesta: {ex.Message}");
            await SendErrorAsync(userId, ex.Message);
        }
        finally
        {
            _betLock.Release();
        }
    }

    private async Task HandleSpinAsync(string userId, JsonElement message)
    {
        Console.WriteLine("Entrando en HandleSpinAsync");

        if (!TryGetTableId(message, out int tableId)) return;
        if (!TryGetMatch(tableId, userId, out var match)) return;
        if (!TryGetRouletteGame(tableId, userId, out var rouletteGame)) return;

        rouletteGame.SpinWheel();
        var result = rouletteGame.GetResult();
        Console.WriteLine($"Resultado: {result.Number} - {result.Color}");

        var allResults = rouletteGame.EvaluateAll(match.Players);

        UnitOfWork unitOfWork = GetScopedService<UnitOfWork>(out var scope);
        using (scope)
        {
            foreach (var p in match.Players)
            {
                unitOfWork.UserRepository.Update(p.User);
            }
            await unitOfWork.SaveAsync();
        }

        foreach(var player in match.Players)
        {
            var spinResults = allResults.GetValueOrDefault(player.UserId) ?? new List<RouletteSpinResult>();

            var payload = new
            {
                type = Type,
                action = RouletteMessageType.SpinResult,
                result = new
                {
                    number = result.Number,
                    color = result.Color
                },
                results = spinResults.Select(r => new
                {
                    bet = r.Bet.ToString(),
                    won = r.Won,
                    payout = r.Payout,
                    remainingCoins = r.RemainingCoins
                }).ToList()
            };
            await ((IWebSocketSender)this).SendToUserAsync(player.UserId.ToString(), payload);
        }
        rouletteGame.Reset();

        Console.WriteLine("Ronda finalizada y resultados enviados.");
    }

    private RouletteBet BuildRouletteBet(JsonElement message)
    {
        var betType = Enum.Parse<RouletteBetType>(message.GetProperty("betType").GetString()!, ignoreCase: true);
        int amount = message.GetProperty("amount").GetInt32();

        var bet = new RouletteBet
        {
            BetType = betType,
            Amount = amount
        };

        if (message.TryGetProperty("number", out var numProp))
            bet.Number = numProp.GetInt32();

        if (message.TryGetProperty("color", out var colorProp))
            bet.Color = colorProp.GetString();

        if (message.TryGetProperty("evenOdd", out var evenOddProp))
            bet.EvenOdd = Enum.Parse<RouletteSimpleChoice>(evenOddProp.GetString()!, ignoreCase: true);

        if (message.TryGetProperty("dozen", out var dozenProp))
            bet.Dozen = dozenProp.GetInt32();

        if (message.TryGetProperty("column", out var columnProp))
            bet.Column = columnProp.GetInt32();

        if (message.TryGetProperty("highLow", out var highLowProp))
            bet.HighLow = Enum.Parse<RouletteSimpleChoice>(highLowProp.GetString()!, ignoreCase: true);

        return bet;
    }

    private async Task BroadcastGameStateAsync(int tableId)
    {
        if (!TryGetMatch(tableId, "SYSTEM", out var match)) return;
        if (!TryGetRouletteGame(tableId, "SYSTEM", out var rouletteGame)) return;

        var statePayload = new
        {
            type = Type,
            action = RouletteMessageType.GameState,
            tableId,
            players = match.Players.Select(p => new
            {
                userId = p.UserId,
                nickName = p.User.NickName,
                remainingCoins = p.User.Coins,
                bets = rouletteGame.GetBetsForPlayer(p.UserId).Select(b => new
                {
                    bet = b.ToString(),
                    amount = b.Amount
                }).ToList()

            })
        };

        foreach(var player in match.Players)
        {
            await ((IWebSocketSender)this).SendToUserAsync(player.UserId.ToString(), statePayload);
        }

    }



    public Task ForceAdvanceTurnAsync(int tableId, int userId)
    {
        return Task.CompletedTask;
    }

    // Metodos TRY

    private bool TryGetTableId(JsonElement message, out int tableId)
    {
        tableId = 0;
        if (!message.TryGetProperty("tableId", out var tableIdProp) ||
            !int.TryParse(tableIdProp.GetString(), out tableId))
        {
            Console.WriteLine("TableId inválido.");
            return false;
        }
        return true;
    }

    private bool TryGetMatch(int tableId, string userId, out Match match)
    {
        if (!ActiveGameMatchStore.TryGet(tableId, out match))
        {
            Console.WriteLine($"No se encontró Match en la mesa {tableId}");
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
            Console.WriteLine($"Jugador {userId} no encontrado en Match.");
            _ = SendErrorAsync(userId, "Jugador no encontrado en la mesa.");
            return false;
        }
        return true;
    }

    private bool TryGetRouletteGame(int tableId, string userId, out RouletteGame rouletteGame)
    {
        if (!ActiveRouletteGameStore.TryGet(tableId, out rouletteGame))
        {
            Console.WriteLine($"No hay partida activa de ruleta en mesa {tableId}");
            _ = SendErrorAsync(userId, "No hay partida activa de ruleta en esta mesa.");
            return false;
        }
        return true;
    }



}
