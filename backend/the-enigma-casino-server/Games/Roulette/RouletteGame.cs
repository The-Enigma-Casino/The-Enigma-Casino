using the_enigma_casino_server.Games.Roulette.Enums;
using the_enigma_casino_server.Games.Shared.Entities;

namespace the_enigma_casino_server.Games.Roulette;

public class RouletteGame
{
    private readonly RouletteWheel _wheel = new();
    private readonly Dictionary<int, List<RouletteBet>> _betsByPlayer = new();


    public int LastNumber { get; private set; }
    public string LastColor { get; private set; }
    public double? LastWheelRotation { get; set; }
    public double? LastBallRotation { get; private set; }
    public double AccumulatedRotation { get; private set; } = 0;


    private readonly List<RouletteResult> _lastResults = new();
    public IReadOnlyList<RouletteResult> LastResults => _lastResults;

    private bool _canAcceptBets = true;
    public bool CanAcceptBets => _canAcceptBets;
    public void PauseBetting() => _canAcceptBets = false;
    public void ResumeBetting() => _canAcceptBets = true;


    public void RegisterBet(Player player, RouletteBet bet)
    {
        if (!_canAcceptBets)
            throw new InvalidOperationException("Las apuestas están cerradas en este momento.");

        if (bet.Amount > player.User.Coins)
            throw new InvalidOperationException("No tienes suficientes fichas.");

        if (bet.Amount <= 0)
            throw new InvalidOperationException("La apuesta debe ser mayor que cero.");

        if (!bet.IsValid())
            throw new InvalidOperationException("La apuesta no es válida.");

        if (HasAlreadyPlacedSameBet(player, bet))
            throw new InvalidOperationException("Ya hiciste esta misma apuesta en esta ronda.");

        player.User.Coins -= bet.Amount;

        if (!_betsByPlayer.ContainsKey(player.UserId))
            _betsByPlayer[player.UserId] = new List<RouletteBet>();

        _betsByPlayer[player.UserId].Add(bet);
    }

    public void SpinWheel()
    {
        LastNumber = _wheel.Spin();
        LastColor = RouletteWheel.GetColor(LastNumber);

        var (wheelRotation, ballRotation) =
            RouletteWheel.GenerateSpinAnimationData(LastNumber, AccumulatedRotation);

        LastWheelRotation = wheelRotation;
        LastBallRotation = ballRotation;
        AccumulatedRotation = wheelRotation;

        Console.WriteLine($"[WS] Wheel saved: {LastWheelRotation}");

        var result = new RouletteResult(LastNumber, LastColor);
        _lastResults.Add(result);

        if (_lastResults.Count > 5)
            _lastResults.RemoveAt(0);
    }



    public Dictionary<int, List<RouletteSpinResult>> EvaluateAll(List<Player> players)
    {
        Dictionary<int, List<RouletteSpinResult>> allResults = new();

        foreach (Player player in players)
        {
            List<RouletteSpinResult> results = EvaluatePlayer(player);
            allResults[player.UserId] = results;
        }

        return allResults;
    }

    public void Reset()
    {
        _betsByPlayer.Clear();
    }

    public RouletteResult GetResult()
    {
        return new RouletteResult(LastNumber, LastColor);
    }


    public List<RouletteBet> GetBetsForPlayer(int userId)
    {
        return _betsByPlayer.GetValueOrDefault(userId) ?? new();
    }

    public bool HasPlayerBet(int userId)
    {
        return _betsByPlayer.ContainsKey(userId);
    }

    public List<int> GetAllPlayersWhoHaveBet()
    {
        return _betsByPlayer.Keys.ToList();
    }


    private bool HasAlreadyPlacedSameBet(Player player, RouletteBet bet)
    {
        if (!_betsByPlayer.TryGetValue(player.UserId, out List<RouletteBet> existingBets))
            return false;

        foreach (RouletteBet existingBet in existingBets)
        {
            if (existingBet.BetType != bet.BetType)
                continue;

            bool isDuplicate = bet.BetType switch
            {
                RouletteBetType.Straight => existingBet.Number == bet.Number,
                RouletteBetType.Color => string.Equals(existingBet.Color, bet.Color, StringComparison.OrdinalIgnoreCase),
                RouletteBetType.EvenOdd => existingBet.EvenOdd == bet.EvenOdd,
                RouletteBetType.Dozen => existingBet.Dozen == bet.Dozen,
                RouletteBetType.Column => existingBet.Column == bet.Column,
                RouletteBetType.HighLow => existingBet.HighLow == bet.HighLow,
                _ => false
            };

            if (isDuplicate)
                return true;
        }

        return false;
    }

    private List<RouletteSpinResult> EvaluatePlayer(Player player)
    {
        List<RouletteSpinResult> results = new();
        List<RouletteBet> bets = _betsByPlayer.GetValueOrDefault(player.UserId) ?? new();

        foreach (RouletteBet bet in bets)
        {
            bool won = BetEvaluator.CheckWin(bet, LastNumber, LastColor);
            int payout = won ? bet.Amount * bet.CalculatePayoutMultiplier() : 0;

            if (won)
                player.Win(payout + bet.Amount);
            else
                player.Lose();

            results.Add(new RouletteSpinResult
            {
                Number = LastNumber,
                Color = LastColor,
                Bet = bet,
                Won = won,
                Payout = payout,
                RemainingCoins = player.User.Coins
            });
        }

        return results;
    }

    public record RouletteResult(int Number, string Color);
}
