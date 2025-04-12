using BlackJackGame.Entities;
using BlackJackGame.Enum;
using PokerGame.Entities;
using System;
using System.Collections.Generic;
using System.Linq;

namespace PokerGame.Services
{
    public class PokerHandEvaluator
    {
        // Evalua mano de un jugador segun combinacion y devuelve un objeto con descripcion y "fuerza" de la mano
        public static EvaluatedHand Evaluate(Player player, List<Card> allCards)
        {
            // Agrupa por valor segun la cantidad de veces que aparece la carta, valor y orden desc
            var grouped = allCards
                .GroupBy(c => c.Rank)
                .OrderByDescending(g => g.Count())
                .ThenByDescending(g => g.Key)
                .ToList();

            // Busca grupo de cartas del mismo palo para el flush (>=5 Cartas del mismo palo)
            var flushGroup = allCards
                .GroupBy(c => c.Suit)
                .FirstOrDefault(g => g.Count() >= 5);

            // STRAIGHT FLUSH - ESCALERA DE COLOR
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
                        Strength = 9, // Maxima fuerza ganadora, escalera de color...
                                      // straigh flush la mejor combinacion posible con "9" y va descendiendo segun bajas el codigo hasta el 1 que es carta alta, es decir la peor jugada posible.
                        HighCard = straightFlushHigh.Value,
                        RankList = new List<CardRank> { straightFlushHigh.Value }
                    };
                }
            }

            // FOUR OF A KIND - "POKER" (4 cartas iguales)
            if (grouped[0].Count() == 4)
            {
                var kicker = allCards.Where(c => c.Rank != grouped[0].Key).OrderByDescending(c => c.Rank).First().Rank;
                return new EvaluatedHand
                {
                    Player = player,
                    Description = $"Póker: {grouped[0].Key}s",
                    Strength = 8, // La fuerza va descendiendo (2 mejor jugada)...
                    HighCard = grouped[0].Key,
                    RankList = new List<CardRank> { grouped[0].Key, kicker }
                };
            }

            // FULL HOUSE - FULL ( 3 cartas iguales y 2 iguales)
            var trios = grouped.Where(g => g.Count() >= 3).ToList();
            var pairs = grouped.Where(g => g.Count() >= 2).ToList();

            if (trios.Any())
            {
                var mainTrio = trios.First();
                var secondPair = pairs.FirstOrDefault(p => p.Key != mainTrio.Key)
                                 ?? trios.Skip(1).FirstOrDefault(); // usa segundo trío como pareja

                if (secondPair != null)
                {
                    return new EvaluatedHand
                    {
                        Player = player,
                        Description = $"Full: {mainTrio.Key}s con {secondPair.Key}s",
                        Strength = 7,
                        HighCard = mainTrio.Key,
                        RankList = new List<CardRank> { mainTrio.Key, secondPair.Key }
                    };
                }
            }

            // FLUSH - COLOR ( 5 cartas del mismo color, se evalua arriba) 
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

            // STRAIGHT - ESCALERA (Ej: 9,10,J,Q,K)
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

            // THREE OF A KIND - TRIO
            if (grouped[0].Count() == 3)
            {
                var kickers = allCards.Where(c => c.Rank != grouped[0].Key).OrderByDescending(c => c.Rank).Take(2).ToList();
                return new EvaluatedHand
                {
                    Player = player,
                    Description = $"Trio de : {grouped[0].Key}s",
                    Strength = 4,
                    HighCard = grouped[0].Key,
                    RankList = new List<CardRank> { grouped[0].Key }.Concat(kickers.Select(k => k.Rank)).ToList()
                };
            }

            // TWO PAIR - DOBLE PAREJA
            var allPairs = grouped.Where(g => g.Count() == 2).OrderByDescending(g => g.Key).ToList();

            if (allPairs.Count >= 2)
            {
                var highPair = allPairs[0].Key;
                var lowPair = allPairs[1].Key;
                var kicker = allCards
                    .Where(c => c.Rank != highPair && c.Rank != lowPair)
                    .OrderByDescending(c => c.Rank)
                    .FirstOrDefault()?.Rank ?? highPair;

                return new EvaluatedHand
                {
                    Player = player,
                    Description = $"DOBLE PAREJA: {highPair}s and {lowPair}s",
                    Strength = 3,
                    HighCard = highPair,
                    RankList = new List<CardRank> { highPair, lowPair, kicker }
                };
            }

            // ONE PAIR - PAREJA
            if (grouped[0].Count() == 2)
            {
                var pairRank = grouped[0].Key;
                var kickers = allCards.Where(c => c.Rank != pairRank).OrderByDescending(c => c.Rank).Take(3).ToList();

                return new EvaluatedHand
                {
                    Player = player,
                    Description = $"PAREJA DE {pairRank}s",
                    Strength = 2,
                    HighCard = pairRank,
                    RankList = new List<CardRank> { pairRank }.Concat(kickers.Select(k => k.Rank)).ToList()
                };
            }

            // HIGH CARD - CARTA ALTA
            var sorted = allCards.OrderByDescending(c => c.Rank).Take(5).ToList();
            return new EvaluatedHand
            {
                Player = player,
                Description = $"Carta Alta: {sorted[0].Rank}",
                Strength = 1, // Peor jugada con menor fuerza
                HighCard = sorted[0].Rank,
                RankList = sorted.Select(c => c.Rank).ToList()
            };
        }

        // Determina carta mas alta en STRAIGHT - ESCALERA
        private static CardRank? GetStraightHighCard(List<Card> cards)
        {
            var ordered = cards
                .Select(c => (int)c.Rank)
                .Distinct()
                .OrderByDescending(v => v)
                .ToList();

            // Excepcion! Si la escalera tiene AS lo comprueba (valor 14)
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
}
