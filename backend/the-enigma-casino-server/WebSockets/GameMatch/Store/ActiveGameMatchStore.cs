using System.Collections.Concurrent;
using the_enigma_casino_server.Games.Poker;
using the_enigma_casino_server.Games.Shared.Entities;

namespace the_enigma_casino_server.WebSockets.GameMatch.Store;

public static class ActiveGameMatchStore
{
    private static readonly ConcurrentDictionary<int, Match> _matches = new();

    public static void Set(int tableId, Match match) => _matches[tableId] = match;

    public static bool TryGet(int tableId, out Match match) => _matches.TryGetValue(tableId, out match);

    public static void Remove(int tableId) => _matches.TryRemove(tableId, out _);

    public static IReadOnlyDictionary<int, Match> GetAll() => _matches;

    public static Match? TryGetNullable(int tableId)
    {
        return _matches.TryGetValue(tableId, out var match) ? match : null;
    }
}