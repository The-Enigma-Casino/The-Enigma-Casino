namespace the_enigma_casino_server.WebSockets.Roulette;

public static class RouletteRotationCache
{
    private static readonly Dictionary<int, double> _wheelRotations = new();

    public static void SaveRotation(int tableId, double rotation)
    {
        _wheelRotations[tableId] = rotation;
    }

    public static double GetRotation(int tableId)
    {
        return _wheelRotations.TryGetValue(tableId, out var rot) ? rot : 0;
    }

    public static void Clear(int tableId)
    {
        _wheelRotations.Remove(tableId);
    }
}
