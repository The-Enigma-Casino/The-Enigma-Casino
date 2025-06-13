using the_enigma_casino_server.Games.Shared.Entities;
using the_enigma_casino_server.Games.Shared.Enum;
using the_enigma_casino_server.WebSockets.Interfaces;

namespace the_enigma_casino_server.WebSockets.Roulette;

public class RouletteExitRuleHandler : IGameExitRuleHandler
{
    public Task<bool> HandlePlayerExitAsync(Player player, Match match)
    {
        if (player.PlayerState == PlayerState.Playing)
        {
            player.PlayerState = PlayerState.Left;
        }

        return Task.FromResult(true);
    }
}