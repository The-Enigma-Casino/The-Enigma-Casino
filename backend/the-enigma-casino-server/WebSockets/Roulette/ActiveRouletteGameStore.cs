using System.Collections.Concurrent;
using the_enigma_casino_server.Games.Roulette;

namespace the_enigma_casino_server.Websockets.Roulette;

public class ActiveRouletteGameStore
{
    private static readonly ConcurrentDictionary<int, RouletteGame> _games = new();
    public static void Set(int tableId, RouletteGame game) => _games[tableId] = game;
    public static bool TryGet(int tableId, out RouletteGame game) => _games.TryGetValue(tableId, out game);
    public static void Remove(int tableId) => _games.TryRemove(tableId, out _);
    public static IReadOnlyDictionary<int, RouletteGame> GetAll() => _games;

}
