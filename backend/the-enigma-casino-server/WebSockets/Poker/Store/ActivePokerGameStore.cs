using System.Collections.Concurrent;
using the_enigma_casino_server.Games.Poker;

namespace the_enigma_casino_server.WebSockets.Poker.Store;

public static class ActivePokerGameStore
{
    private static readonly ConcurrentDictionary<int, PokerGame> _games = new();

    public static void Set(int tableId, PokerGame game) => _games[tableId] = game;

    public static bool TryGet(int tableId, out PokerGame game) => _games.TryGetValue(tableId, out game);

    public static void Remove(int tableId) => _games.TryRemove(tableId, out _);

    public static IReadOnlyDictionary<int, PokerGame> GetAll() => _games;

    public static PokerGame? TryGetNullable(int tableId)
    {
        return _games.TryGetValue(tableId, out var game) ? game : null;
    }
}