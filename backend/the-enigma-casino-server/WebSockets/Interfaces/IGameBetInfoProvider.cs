using the_enigma_casino_server.Games.Shared.Entities;

namespace the_enigma_casino_server.WebSockets.Interfaces;

public interface IGameBetInfoProvider
{
    int GetLastBetAmount(int tableId, int userId);
    int GetChipResult(Player player);
    int GetMatchCountForHistory(Player player);
    bool HasPlayedThisMatch(Player player, Match match);
    int GetMinimumRequiredCoins();
}