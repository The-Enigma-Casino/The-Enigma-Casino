using System.Collections.Concurrent;

namespace the_enigma_casino_server.WebSockets.Poker;

public static class PokerActionTracker
{
    private static readonly ConcurrentDictionary<(int tableId, string phase), HashSet<int>> _actions = new();

    public static void RegisterAction(int tableId, int userId, string phase)
    {
        var key = (tableId, phase);

        if (!_actions.ContainsKey(key))
            _actions[key] = new HashSet<int>();

        _actions[key].Add(userId);
    }

    public static bool HaveAllPlayersActed(int tableId, List<int> expectedPlayerIds, string phase)
    {
        var key = (tableId, phase);

        if (!_actions.TryGetValue(key, out var actualSet)) return false;

        return expectedPlayerIds.All(id => actualSet.Contains(id));
    }

    public static void Clear(int tableId, string phase)
    {
        var key = (tableId, phase);
        _actions.TryRemove(key, out _);
    }

    public static void RemovePlayer(int tableId, int userId, string phase)
    {
        var key = (tableId, phase);
        if (_actions.TryGetValue(key, out var set))
        {
            set.Remove(userId);
        }
    }

    public static List<int> GetAllForTable(int tableId, string phase)
    {
        if (_actions.TryGetValue((tableId, phase), out var players))
        {
            return players.ToList();
        }

        return new List<int>();
    }

    public static void ResetActionsForRaise(int tableId, List<int> userIds, int raiserUserId, string phase)
    {
        var key = (tableId, phase);

        if (!_actions.TryGetValue(key, out var set)) return;

        foreach (var userId in userIds)
        {
            if (userId != raiserUserId)
            {
                set.Remove(userId);
            }
        }
    }

    public static bool HasPlayerActed(int tableId, int userId, string phase)
    {
        var key = (tableId, phase);
        return _actions.TryGetValue(key, out var set) && set.Contains(userId);
    }


}
