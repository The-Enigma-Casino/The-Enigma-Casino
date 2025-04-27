using System.Collections.Concurrent;
using the_enigma_casino_server.Games.Shared.Entities;
using the_enigma_casino_server.Games.Shared.Enum;
using the_enigma_casino_server.WebSockets.Interfaces;

namespace the_enigma_casino_server.Websockets.Roulette;

public class RouletteInactivityTracker : IGameInactivityTracker
{
    private static readonly ConcurrentDictionary<int, int> _inactiveRoundsByUser = new();

    public GameType ForGameType => GameType.Roulette;

    public void ResetActivity(Player player)
    {
        _inactiveRoundsByUser[player.UserId] = 0;
    }

    public void RegisterInactivity(Player player)
    {
        _inactiveRoundsByUser.AddOrUpdate(player.UserId, 1, (_, current) => current + 1);
    }

    public bool ShouldKickPlayer(Player player)
    {
        return _inactiveRoundsByUser.TryGetValue(player.UserId, out var count) && count >= 2;
    }

    public void RemovePlayer(Player player)
    {
        _inactiveRoundsByUser.TryRemove(player.UserId, out _);
    }
}
