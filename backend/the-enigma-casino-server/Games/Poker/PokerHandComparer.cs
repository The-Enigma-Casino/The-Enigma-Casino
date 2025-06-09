using the_enigma_casino_server.Games.Shared.Entities;

namespace the_enigma_casino_server.Games.Poker;

public class PokerHandComparer : IComparer<EvaluatedHand>
{
    public int Compare(EvaluatedHand? x, EvaluatedHand? y)
    {
        if (x == null || y == null) return 0;

        // 1. Comparar fuerza de la jugada
        if (x.Strength != y.Strength)
            return x.Strength.CompareTo(y.Strength);

        // 2. Comparar cartas relevantes (RankList)
        for (int i = 0; i < x.RankList.Count && i < y.RankList.Count; i++)
        {
            int cmp = x.RankList[i].CompareTo(y.RankList[i]);
            if (cmp != 0)
                return cmp;
        }

        // 3. Si todo empata
        return 0;
    }
}
