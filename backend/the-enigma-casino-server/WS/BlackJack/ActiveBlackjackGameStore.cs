using System.Collections.Concurrent;
using the_enigma_casino_server.Games.BlackJack;

namespace the_enigma_casino_server.WS.BlackJackWS.Store;

public static class ActiveBlackjackGameStore
{
    private static readonly ConcurrentDictionary<int, BlackjackGame> _games = new();

    public static void Set(int tableId, BlackjackGame game) => _games[tableId] = game;

    public static bool TryGet(int tableId, out BlackjackGame game) => _games.TryGetValue(tableId, out game);

    public static void Remove(int tableId) => _games.TryRemove(tableId, out _);
}
