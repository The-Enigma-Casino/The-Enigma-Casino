using the_enigma_casino_server.Games.Shared.Entities;
using the_enigma_casino_server.Games.Shared.Enum;
using the_enigma_casino_server.WebSockets.Interfaces;

namespace the_enigma_casino_server.WebSockets.BlackJack;

public class BlackjackExitRuleHandler : IGameExitRuleHandler
{
    public async Task<bool> HandlePlayerExitAsync(Player player, Match match)
    {
        if (!HasAnyPlayerBet(match)) // Solo se devuelve si no ha empezado nada
        {
            player.User.Coins += player.CurrentBet;
            player.CurrentBet = 0;
            return true;
        }

        player.PlayerState = PlayerState.Left;
        player.MatchChipResult = -player.CurrentBet;
        return true;
    }
}
