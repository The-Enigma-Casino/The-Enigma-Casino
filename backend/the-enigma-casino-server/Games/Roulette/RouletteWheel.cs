namespace the_enigma_casino_server.Games.Roulette;

public class RouletteWheel
{
    private static readonly Random _random = new();

    private static readonly HashSet<int> RedNumbers = new()
    {
        1, 3, 5, 7, 9, 12, 14, 16, 18,
        19, 21, 23, 25, 27, 30, 32, 34, 36
    };

    public int Spin()
    {
        return _random.Next(0, 37);
    }

    public static string GetColor(int number)
    {
        return number == 0 ? "green" : RedNumbers.Contains(number) ? "red" : "black";
    }

    public static (double wheelRotation, double ballRotation) GenerateSpinAnimationData(int winningNumber)
    {
        List<int> numbers = new() {
        0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27,
        13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1,
        20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
    };

        double degreesPerNumber = 360.0 / numbers.Count;

        int index = numbers.IndexOf(winningNumber);
        double angleOfNumber = degreesPerNumber * index;

        int wheelSpins = _random.Next(3, 6);
        double wheelRotation = -1 * (wheelSpins * 360 + _random.NextDouble() * 360);

        int ballSpins = _random.Next(5, 8);
        double ballRotation = ballSpins * 360 + angleOfNumber + Math.Abs(wheelRotation);

        return (wheelRotation, ballRotation);
    }

}