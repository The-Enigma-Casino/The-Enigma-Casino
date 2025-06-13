using the_enigma_casino_server.Games.Shared.Entities;
using the_enigma_casino_server.Games.Shared.Enum;
using the_enigma_casino_server.WebSockets.Interfaces;

namespace the_enigma_casino_server.WebSockets.Poker;

public class PokerExitRuleHandler : IGameExitRuleHandler
{
    public Task<bool> HandlePlayerExitAsync(Player player, Match match)
    {
        if (player.PlayerState is PlayerState.Playing or PlayerState.AllIn)
        {
            player.PlayerState = PlayerState.Fold;
        }
        player.HasAbandoned = true;

        return Task.FromResult(true);
    }
}
