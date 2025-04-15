using System.Collections.Concurrent;

namespace the_enigma_casino_server.WebSockets.GameTable.Store;

public static class ActiveGameSessionStore
{
    private static readonly ConcurrentDictionary<int, ActiveGameSession> _sessions = new();

    public static bool TryGet(int tableId, out ActiveGameSession session)
        => _sessions.TryGetValue(tableId, out session);

    public static void Set(int tableId, ActiveGameSession session)
        => _sessions[tableId] = session;

    public static void Remove(int tableId)
        => _sessions.TryRemove(tableId, out _);

    public static IReadOnlyDictionary<int, ActiveGameSession> GetAll()
        => _sessions;
}