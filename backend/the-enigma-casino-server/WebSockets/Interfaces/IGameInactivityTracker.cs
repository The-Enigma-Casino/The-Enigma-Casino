using the_enigma_casino_server.Games.Shared.Entities;
using the_enigma_casino_server.Games.Shared.Enum;

namespace the_enigma_casino_server.WebSockets.Interfaces;

public interface IGameInactivityTracker
{
    GameType ForGameType { get; }

    void ResetActivity(Player player);

    void RegisterInactivity(Player player);

    bool ShouldKickPlayer(Player player);

    void RemovePlayer(Player player);
}