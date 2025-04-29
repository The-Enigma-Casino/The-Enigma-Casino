namespace the_enigma_casino_server.Application.Services;

public class RandomService
{
    private readonly Random _random;

    public RandomService()
    {
        _random = new Random();
    }

    public double NextDouble()
    {
        lock (_random)
        {
            return _random.NextDouble();
        }
    }

    public int Next(int min, int max)
    {
        lock (_random)
        {
            return _random.Next(min, max);
        }
    }
}
