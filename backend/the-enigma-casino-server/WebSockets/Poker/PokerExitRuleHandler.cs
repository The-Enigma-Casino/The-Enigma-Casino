using the_enigma_casino_server.Games.Shared.Entities;
using the_enigma_casino_server.Games.Shared.Enum;
using the_enigma_casino_server.WebSockets.Interfaces;

namespace the_enigma_casino_server.WebSockets.Poker
{
    public class PokerExitRuleHandler : IGameExitRuleHandler
    {
        public async Task<bool> HandlePlayerExitAsync(Player player, Match match)
        {
            // Siempre se considera que están jugando desde el preflop
            player.PlayerState = PlayerState.Left;
            player.MatchChipResult = -player.CurrentBet;

            // Si solo queda uno, darle todas las apuestas
            if (match.Players.Count == 2)
            {
                Player winner = match.Players.First(p => p.UserId != player.UserId);
                winner.MatchChipResult += match.Players.Sum(p => p.CurrentBet);
            }

            return true;
        }
    }
}
