using the_enigma_casino_server.Games.Shared.Entities;
using the_enigma_casino_server.Games.Shared.Enum;

namespace the_enigma_casino_server.Games.Poker;

public class PokerHandEvaluator
{
    public static EvaluatedHand Evaluate(Player player, List<Card> allCards)
    {
        var grouped = allCards
            .GroupBy(c => c.Rank)
            .OrderByDescending(g => g.Count())
            .ThenByDescending(g => g.Key)
            .ToList();

        var flushGroup = allCards
            .GroupBy(c => c.Suit)
            .FirstOrDefault(g => g.Count() >= 5);

        if (flushGroup != null)
        {
            var flushCards = flushGroup.ToList();
            var straightFlushHigh = GetStraightHighCard(flushCards);
            if (straightFlushHigh != null)
            {
                return new EvaluatedHand
                {
                    Player = player,
                    Description = $"Escalera de Color (Carta Alta: {straightFlushHigh})",
                    Strength = 9,
                    HighCard = straightFlushHigh.Value,
                    RankList = new List<CardRank> { straightFlushHigh.Value }
                };
            }
        }

        // Póker
        var four = grouped.FirstOrDefault(g => g.Count() == 4);
        if (four != null)
        {
            var kicker = allCards
                .Where(c => c.Rank != four.Key)
                .OrderByDescending(c => c.Rank)
                .First().Rank;

            return new EvaluatedHand
            {
                Player = player,
                Description = $"Póker: {four.Key}s",
                Strength = 8,
                HighCard = four.Key,
                RankList = new List<CardRank> { four.Key, kicker }
            };
        }

        // Full House
        var trios = grouped.Where(g => g.Count() >= 3).ToList();
        var pairs = grouped.Where(g => g.Count() >= 2).ToList();

        if (trios.Any())
        {
            var trio = trios[0];
            var pair = pairs
                .Where(p => p.Key != trio.Key)
                .OrderByDescending(p => p.Key)
                .FirstOrDefault();

            if (pair != null)
            {
                return new EvaluatedHand
                {
                    Player = player,
                    Description = $"Full: {trio.Key}s con {pair.Key}s",
                    Strength = 7,
                    HighCard = trio.Key,
                    RankList = new List<CardRank> { trio.Key, pair.Key }
                };
            }
            else if (trios.Count >= 2)
            {
                return new EvaluatedHand
                {
                    Player = player,
                    Description = $"Full: {trio.Key}s con {trios[1].Key}s",
                    Strength = 7,
                    HighCard = trio.Key,
                    RankList = new List<CardRank> { trio.Key, trios[1].Key }
                };
            }
        }


        // Color
        if (flushGroup != null)
        {
            var bestFlush = flushGroup.OrderByDescending(c => c.Rank).Take(5).ToList();
            return new EvaluatedHand
            {
                Player = player,
                Description = $"Color ({flushGroup.Key}, Carta Alta: {bestFlush[0].Rank})",
                Strength = 6,
                HighCard = bestFlush[0].Rank,
                RankList = bestFlush.Select(c => c.Rank).ToList()
            };
        }

        // Escalera
        var straightHigh = GetStraightHighCard(allCards);
        if (straightHigh != null)
        {
            return new EvaluatedHand
            {
                Player = player,
                Description = $"Escalera (Carta Alta: {straightHigh})",
                Strength = 5,
                HighCard = straightHigh.Value,
                RankList = new List<CardRank> { straightHigh.Value }
            };
        }

        // Trío
        var three = grouped.FirstOrDefault(g => g.Count() == 3);
        if (three != null)
        {
            var kickers = allCards
                .Where(c => c.Rank != three.Key)
                .OrderByDescending(c => c.Rank)
                .Take(2)
                .ToList();

            return new EvaluatedHand
            {
                Player = player,
                Description = $"Trio de : {three.Key}s",
                Strength = 4,
                HighCard = three.Key,
                RankList = new List<CardRank> { three.Key }.Concat(kickers.Select(k => k.Rank)).ToList()
            };
        }

        // Doble pareja
        var allPairs = grouped.Where(g => g.Count() == 2).OrderByDescending(g => g.Key).ToList();
        if (allPairs.Count >= 2)
        {
            var highPair = allPairs[0].Key;
            var lowPair = allPairs[1].Key;

            var kicker = allCards
                .Where(c => c.Rank != highPair && c.Rank != lowPair)
                .OrderByDescending(c => c.Rank)
                .Select(c => c.Rank)
                .FirstOrDefault();

            return new EvaluatedHand
            {
                Player = player,
                Description = $"DOBLE PAREJA: {highPair}s and {lowPair}s",
                Strength = 3,
                HighCard = highPair,
                RankList = new List<CardRank> { highPair, lowPair, kicker }
            };
        }

        // Pareja
        var pairOnly = grouped.FirstOrDefault(g => g.Count() == 2);
        if (pairOnly != null)
        {
            var kickers = allCards
                .Where(c => c.Rank != pairOnly.Key)
                .OrderByDescending(c => c.Rank)
                .Take(3)
                .ToList();

            return new EvaluatedHand
            {
                Player = player,
                Description = $"PAREJA DE {pairOnly.Key}s",
                Strength = 2,
                HighCard = pairOnly.Key,
                RankList = new List<CardRank> { pairOnly.Key }.Concat(kickers.Select(k => k.Rank)).ToList()
            };
        }

        // Carta alta
        var sorted = allCards.OrderByDescending(c => c.Rank).Take(5).ToList();
        return new EvaluatedHand
        {
            Player = player,
            Description = $"Carta Alta: {sorted[0].Rank}",
            Strength = 1,
            HighCard = sorted[0].Rank,
            RankList = sorted.Select(c => c.Rank).ToList()
        };
    }

    private static CardRank? GetStraightHighCard(List<Card> cards)
    {
        var ordered = cards
            .Select(c => (int)c.Rank)
            .Distinct()
            .OrderByDescending(v => v)
            .ToList();

        if (ordered.Contains(14) && ordered.Contains(2) && ordered.Contains(3) && ordered.Contains(4) && ordered.Contains(5))
        {
            return CardRank.Five;
        }

        for (int i = 0; i <= ordered.Count - 5; i++)
        {
            if (ordered[i] - ordered[i + 4] == 4)
            {
                return (CardRank)ordered[i];
            }
        }
        return null;
    }
}
