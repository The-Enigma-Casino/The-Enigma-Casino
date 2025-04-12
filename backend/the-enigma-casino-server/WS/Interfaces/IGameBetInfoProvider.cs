using the_enigma_casino_server.Games.Shared.Entities;
using the_enigma_casino_server.Games.Shared.Entities.Enum;

namespace the_enigma_casino_server.WS.Interfaces;

public interface IGameBetInfoProvider
{
    int GetLastBetAmount(int tableId, int userId);
    int GetChipResult(Player player);
    int GetMatchCountForHistory(Player player);
}



// IMPORTANTE 

//private static int GetMatchCountForGameType(GameType gameType)
//{
//    return gameType switch
//    {
//        GameType.BlackJack => 1,
//        GameType.Roulette => 1,
//        GameType.Poker => 0,
//        _ => 1
//    };
//}