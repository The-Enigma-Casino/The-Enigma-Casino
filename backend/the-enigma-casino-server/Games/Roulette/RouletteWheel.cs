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
}