using System.Collections.Concurrent;
using the_enigma_casino_server.Games.Shared.Entities;
using the_enigma_casino_server.Games.Shared.Enum;
using the_enigma_casino_server.WebSockets.Interfaces;

namespace the_enigma_casino_server.WebSockets.Poker;

public class PokerInactivityTracker : IGameInactivityTracker
{
    private static readonly ConcurrentDictionary<int, int> _inactivityCounts = new();
    private static readonly ConcurrentDictionary<int, bool> _missedFirstTurn = new();

    public GameType ForGameType => GameType.Poker;

    public void ResetActivity(Player player)
    {
        _inactivityCounts[player.UserId] = 0;
        _missedFirstTurn.TryRemove(player.UserId, out _);
    }

    public void RegisterInactivity(Player player)
    {
        int count = _inactivityCounts.AddOrUpdate(player.UserId, 1, (_, prev) => prev + 1);
        Console.WriteLine($"📛 {player.User.NickName} inactividad acumulada: {count}");
    }


    public bool ShouldKickPlayer(Player player)
    {
        return player.HasAbandoned;
    }

    public void RemovePlayer(Player player)
    {
        _inactivityCounts.TryRemove(player.UserId, out _);
        _missedFirstTurn.TryRemove(player.UserId, out _);
    }

    public int GetInactivityCount(Player player)
    {
        return _inactivityCounts.TryGetValue(player.UserId, out var count) ? count : 0;
    }
}
