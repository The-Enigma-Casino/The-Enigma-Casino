using the_enigma_casino_server.Games.Roulette.Enums;

namespace the_enigma_casino_server.Games.Roulette;

public static class BetEvaluator
{
    public static bool CheckWin(RouletteBet bet, int result, string color)
    {
        return bet.BetType switch
        {
            RouletteBetType.Straight =>
                bet.Number.HasValue && bet.Number == result,

            RouletteBetType.Color =>
                !string.IsNullOrWhiteSpace(bet.Color) &&
                string.Equals(color, bet.Color, StringComparison.OrdinalIgnoreCase),

            RouletteBetType.EvenOdd => result != 0 &&
                (
                    (result % 2 == 0 && bet.EvenOdd == RouletteSimpleChoice.Even) ||
                    (result % 2 != 0 && bet.EvenOdd == RouletteSimpleChoice.Odd)
                ),

            RouletteBetType.Dozen => result switch
            {
                >= 1 and <= 12 => bet.Dozen == 1,
                >= 13 and <= 24 => bet.Dozen == 2,
                >= 25 and <= 36 => bet.Dozen == 3,
                _ => false
            },

            RouletteBetType.Column =>
                result != 0 && bet.Column.HasValue && ((result - 1) % 3 + 1 == bet.Column),

            RouletteBetType.HighLow => result switch
            {
                >= 1 and <= 18 => bet.HighLow == RouletteSimpleChoice.Low,
                >= 19 and <= 36 => bet.HighLow == RouletteSimpleChoice.High,
                _ => false
            },

            _ => false
        };
    }
}