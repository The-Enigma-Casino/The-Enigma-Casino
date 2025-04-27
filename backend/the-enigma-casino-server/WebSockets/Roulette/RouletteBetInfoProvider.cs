using the_enigma_casino_server.Games.Roulette;
using the_enigma_casino_server.Games.Shared.Entities;
using the_enigma_casino_server.WebSockets.Interfaces;

namespace the_enigma_casino_server.Websockets.Roulette;

public class RouletteBetInfoProvider : IGameBetInfoProvider
{
    public int GetLastBetAmount(int tableId, int userId)
    {
        if (ActiveRouletteGameStore.TryGet(tableId, out var rouletteGame))
        {
            var bets = rouletteGame.GetBetsForPlayer(userId);
            return bets.Sum(b => b.Amount);
        }

        return 0;
    }

    public int GetChipResult(Player player)
    {
        if (ActiveRouletteGameStore.TryGet(player.GameTableId, out var rouletteGame))
        {
            var bets = rouletteGame.GetBetsForPlayer(player.UserId);

            int totalBet = bets.Sum(bet => bet.Amount);

            int totalWin = bets.Sum(bet =>
            {
                bool won = BetEvaluator.CheckWin(bet, rouletteGame.LastNumber, rouletteGame.LastColor);
                return won ? bet.Amount * (bet.CalculatePayoutMultiplier() + 1) : 0;
            });

            return totalWin - totalBet;
        }

        return 0;
    }


    public int GetMatchCountForHistory(Player player)
    {
        return 1;
    }

    public bool HasPlayedThisMatch(Player player, Match match)
    {
        if (ActiveRouletteGameStore.TryGet(match.GameTableId, out var rouletteGame))
        {
            var bets = rouletteGame.GetBetsForPlayer(player.UserId);
            return bets.Any();
        }

        return false;
    }


    public int GetMinimumRequiredCoins()
    {
        return 20;
    }
}
