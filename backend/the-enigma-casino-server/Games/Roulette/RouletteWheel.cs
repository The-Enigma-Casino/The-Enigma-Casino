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

    public static (double wheelRotation, double ballRotation) GenerateSpinAnimationData(
     int winningNumber,
     double previousRotation)
    {
        List<int> numbers = new() {
        0, 26, 3, 35, 12, 28, 7, 29, 18, 22, 9, 31,
        14, 20, 1, 33, 16, 24, 5, 10, 23, 8, 30, 11,
        36, 13, 27, 6, 34, 17, 25, 2, 21, 4, 19, 15, 32
    };

        double degreesPerNumber = 360.0 / numbers.Count;

        int index = numbers.IndexOf(winningNumber);
        double winningAngle = degreesPerNumber * index;

        int spins = _random.Next(3, 6);
        double extraDegrees = _random.NextDouble() * 360;

        double diskRotation = previousRotation + (spins * 360) + extraDegrees;

        double diskAngle = diskRotation % 360;

        double correctedAngle = (winningAngle - diskAngle + 360) % 360;

        double ballRotation = -1 * ((360 * (spins + 1)) + correctedAngle);

        return (diskRotation, ballRotation);
    }


    //public static (double wheelRotation, double ballRotation) GenerateSpinAnimationData(int winningNumber)
    //{
    //    List<int> numbers = new() {
    //    0, 26, 3, 35, 12, 28, 7, 29, 18, 22, 9, 31,
    //    14, 20, 1, 33, 16, 24, 5, 10, 23, 8, 30, 11,
    //    36, 13, 27, 6, 34, 17, 25, 2, 21, 4, 19, 15, 32
    //};

    //    double degreesPerNumber = 360.0 / numbers.Count;

    //    int index = numbers.IndexOf(winningNumber);
    //    double angleOfNumber = degreesPerNumber * index;

    //    int wheelSpins = _random.Next(3, 6);
    //    double wheelRotation = -1 * (wheelSpins * 360 + _random.NextDouble() * 360); 

    //    int ballSpins = _random.Next(5, 8);
    //    double ballRotation = ballSpins * 360 + angleOfNumber - wheelRotation;

    //    return (wheelRotation, ballRotation);
    //}
}