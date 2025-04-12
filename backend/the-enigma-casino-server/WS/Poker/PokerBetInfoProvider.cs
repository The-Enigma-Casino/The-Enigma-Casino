using the_enigma_casino_server.Games.Shared.Entities;
using the_enigma_casino_server.WS.Interfaces;

namespace the_enigma_casino_server.WS.PokerWS;

public class PokerBetInfoProvider : IGameBetInfoProvider
{
    public int GetLastBetAmount(int tableId, int userId)
    {
        if (ActivePokerGameStore.TryGet(tableId, out var pokerGame))
        {
            return pokerGame.GetLastBetAmount(userId);
        }

        return 0;
    }

    public int GetChipResult(Player player)
    {
        if (ActivePokerGameStore.TryGet(player.GameTableId, out var pokerGame))
        {
            return pokerGame.GetChipResult(player.UserId);
        }

        return 0;
    }

    public int GetMatchCountForHistory(Player player)
    {
        return 1;
    }
}
