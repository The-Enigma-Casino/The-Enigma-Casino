using System.Collections.Concurrent;

namespace the_enigma_casino_server.WebSockets.BlackJack;

public static class BlackjackBetTracker
{
    private static readonly ConcurrentDictionary<int, HashSet<int>> _betsByTable = new();

    public static void RegisterBet(int tableId, int userId)
    {
        if (!_betsByTable.ContainsKey(tableId))
            _betsByTable[tableId] = new HashSet<int>();

        _betsByTable[tableId].Add(userId);
    }

    public static bool HaveAllPlayersBet(int tableId, List<int> expectedPlayerIds)
    {
        if (!_betsByTable.TryGetValue(tableId, out var actualSet)) return false;

        return expectedPlayerIds.All(id => actualSet.Contains(id));
    }

    public static void Clear(int tableId)
    {
        _betsByTable.TryRemove(tableId, out _);
    }

    public static void RemovePlayer(int tableId, int userId)
    {
        if (_betsByTable.TryGetValue(tableId, out var set))
        {
            set.Remove(userId);
        }
    }

    public static List<int> GetAllForTable(int tableId)
    {
        if (_betsByTable.TryGetValue(tableId, out var playerIds))
        {
            return playerIds.ToList();
        }

        return new List<int>();
    }


}