using the_enigma_casino_server.Games.Shared.Entities;

namespace the_enigma_casino_server.Games.Poker;
public class PokerHandComparer : IComparer<EvaluatedHand>
{
    // Evalua dos manos de poker y las compara
    public int Compare(EvaluatedHand x, EvaluatedHand y)
    {
        if (x == null || y == null) return 0;
        // Primero compara las FUERZAS del 9 - 1
        int strengthComparison = x.Strength.CompareTo(y.Strength);
        if (strengthComparison != 0) return strengthComparison;

        // Si la fuerza de las manos es igual, comparamos las cartas dentro de cada mano (RankList).
        for (int i = 0; i < Math.Min(x.RankList.Count, y.RankList.Count); i++)
        {
            // Compara cartas 1 a 1
            int cmp = x.RankList[i].CompareTo(y.RankList[i]);
            if (cmp != 0) return cmp;
        }
        // Si las manos son iguales, devuelve 0
        return 0;
    }
}

