using System.Collections.Concurrent;
using the_enigma_casino_server.Games.Poker;

namespace the_enigma_casino_server.WebSockets.Poker.Store;

public static class ActivePokerGameStore
{
    private static readonly ConcurrentDictionary<int, PokerGameService> _games = new();

    public static void Set(int tableId, PokerGameService game) => _games[tableId] = game;

    public static bool TryGet(int tableId, out PokerGameService game) => _games.TryGetValue(tableId, out game);

    public static void Remove(int tableId) => _games.TryRemove(tableId, out _);

    public static IReadOnlyDictionary<int, PokerGameService> GetAll() => _games;
}