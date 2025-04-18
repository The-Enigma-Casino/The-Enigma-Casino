using the_enigma_casino_server.Games.Shared.Entities;
using the_enigma_casino_server.WebSockets.Interfaces;
using the_enigma_casino_server.WebSockets.Poker.Store;

namespace the_enigma_casino_server.WebSockets.Poker;

public class PokerBetInfoProvider : IGameBetInfoProvider
{
    public int GetLastBetAmount(int tableId, int userId)
     => PokerBetTracker.GetTotalBet(tableId, userId);

    public int GetChipResult(Player player)
        => PokerBetTracker.GetChipResult(player.GameTableId, player.UserId);

    public int GetMatchCountForHistory(Player player)
    {
        return 1;
    }

    public bool HasPlayedThisMatch(Player player, Match match)
    {
        throw new NotImplementedException();
    }
}
