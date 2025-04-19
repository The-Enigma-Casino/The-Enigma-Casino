using the_enigma_casino_server.Games.Shared.Enum;
using the_enigma_casino_server.Games.Shared.Entities;
using the_enigma_casino_server.WebSockets.Interfaces;

namespace the_enigma_casino_server.WebSockets.BlackJack;

public class BlackjackBetInfoProvider : IGameBetInfoProvider
{
    public int GetLastBetAmount(int tableId, int userId)
    {
        if (ActiveBlackjackGameStore.TryGet(tableId, out var blackjackGame))
        {
            return blackjackGame.GetLastBetAmount(userId);
        }

        return 0;
    }

    public int GetChipResult(Player player)
    {
        int lastBet = GetLastBetAmount(player.GameTableId, player.UserId);

        return player.PlayerState switch
        {
            PlayerState.Blackjack => (int)(lastBet * 1.5),
            PlayerState.Win => lastBet,
            PlayerState.Draw => 0,
            PlayerState.Lose or PlayerState.Bust or PlayerState.Left => -lastBet,
            _ => 0
        };
    }


    public int GetMatchCountForHistory(Player player)
    {
        return 1;
    }

    public bool HasPlayedThisMatch(Player player, Match match)
    {
        return player.Hand != null && player.Hand.Cards.Count > 0;
    }
}