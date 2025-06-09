using the_enigma_casino_server.Core.Entities;
using the_enigma_casino_server.Games.Poker;
using the_enigma_casino_server.Games.Shared.Entities;
using the_enigma_casino_server.Games.Shared.Enum;

namespace the_enigma_casino_server.Tests;

public static class PokerHandEvaluatorTest
{
    public static void Run()
    {
        var tests = new List<(string Title, string[] Noa, string[] Mini, string[] Community, string Expected)>
        {
            ("Escalera en mesa, empate total", new[] { "2♣", "3♦" }, new[] { "4♠", "5♠" }, new[] { "6♥", "7♣", "8♦", "9♠", "10♣" }, "Draw"),
            ("Color en mesa, empate total", new[] { "2♠", "3♠" }, new[] { "4♠", "5♠" }, new[] { "6♠", "7♠", "8♥", "9♣", "10♦" }, "Draw"),
            ("Full en mesa, empate total", new[] { "2♣", "3♦" }, new[] { "4♠", "5♠" }, new[] { "6♥", "6♦", "6♣", "3♣", "3♠" }, "Draw"),
            ("Poker en mesa, empate total", new[] { "2♠", "3♦" }, new[] { "4♣", "5♣" }, new[] { "9♠", "9♣", "9♦", "9♥", "10♣" }, "Draw"),
            ("Doble pareja, Noa gana por kicker", new[] { "7♥", "A♠" }, new[] { "7♦", "K♣" }, new[] { "7♣", "2♦", "2♠", "Q♠", "5♣" }, "Noa"),
            ("Doble pareja, Mini gana por kicker", new[] { "7♥", "Q♠" }, new[] { "7♦", "A♠" }, new[] { "7♣", "2♦", "2♠", "K♠", "5♣" }, "Mini"),
            ("Carta alta, Noa gana", new[] { "A♥", "7♠" }, new[] { "K♦", "Q♣" }, new[] { "2♣", "3♦", "4♠", "6♥", "8♣" }, "Noa"),
            ("Carta alta, Noa gana (Mini sin pareja)", new[] { "6♠", "6♥" }, new[] { "A♦", "Q♣" }, new[] { "2♣", "3♦", "4♠", "8♣", "9♦" }, "Noa"),
            ("Flush, Noa gana con As", new[] { "A♥", "2♥" }, new[] { "K♥", "Q♥" }, new[] { "J♥", "9♥", "8♠", "4♣", "3♦" }, "Noa"),
            ("Flush, Mini gana con As", new[] { "K♥", "Q♥" }, new[] { "A♥", "2♥" }, new[] { "J♥", "9♥", "8♠", "4♣", "3♦" }, "Mini"),
            ("Full house, Mini gana con póker", new[] { "K♠", "K♦" }, new[] { "Q♣", "Q♦" }, new[] { "K♥", "Q♥", "Q♠", "A♠", "5♣" }, "Mini"),
            ("Full house, Mini gana con trío superior", new[] { "K♠", "K♦" }, new[] { "A♣", "A♦" }, new[] { "A♥", "K♣", "K♥", "A♠", "5♣" }, "Mini"),
            ("Doble pareja en mesa, Noa tiene Full", new[] { "A♥", "K♠" }, new[] { "A♦", "Q♣" }, new[] { "K♣", "K♦", "A♠", "2♣", "3♦" }, "Noa"),
            ("Trío, Noa gana por kicker", new[] { "5♥", "K♠" }, new[] { "5♦", "Q♣" }, new[] { "5♣", "2♦", "4♠", "8♥", "3♣" }, "Noa"),
            ("Trío, Mini gana por kicker", new[] { "5♦", "Q♣" }, new[] { "5♥", "K♠" }, new[] { "5♣", "2♦", "4♠", "8♥", "3♣" }, "Mini"),
            ("Full house con trío en mano", new[] { "2♣", "9♠" }, new[] { "A♠", "J♦" }, new[] { "4♦", "2♦", "2♠", "7♠", "4♣" }, "Noa")

        };

        int ok = 0;
        foreach (var (title, noa, mini, community, expected) in tests)
        {
            Console.WriteLine($"\n🧪 Test: {title}");

            var playerA = CreatePlayer(1, "Noa", noa);
            var playerB = CreatePlayer(2, "Mini", mini);
            var communityCards = ParseCards(community);

            var aCards = playerA.Hand.Cards.Concat(communityCards).ToList();
            var bCards = playerB.Hand.Cards.Concat(communityCards).ToList();

            var cmp = new PokerHandComparer();
            var resultA = PokerHandEvaluator.Evaluate(playerA, aCards);
            var resultB = PokerHandEvaluator.Evaluate(playerB, bCards);

            int res = cmp.Compare(resultA, resultB);
            string winner = res > 0 ? "Noa" : res < 0 ? "Mini" : "Draw";

            Console.WriteLine($"Noa: {resultA.Description} | Mini: {resultB.Description} → Winner: {winner}");
            Console.WriteLine($"🔎 Esperado: {expected}");

            bool passed = winner == expected;
            if (passed) ok++;

            Console.WriteLine($"OK: {passed}");
        }

        Console.WriteLine($"\n---\nTotal tests: {tests.Count}");
        Console.WriteLine($"✅ Evaluador: {ok}/{tests.Count}");
    }

    private static Player CreatePlayer(int id, string name, string[] cards)
    {
        var player = new Player(new User { Id = id, NickName = name, Coins = 1000 })
        {
            PlayerState = PlayerState.Playing,
            Hand = new Hand()
        };

        foreach (var cardStr in cards)
            player.Hand.AddCard(ParseCard(cardStr));
        return player;
    }

    private static List<Card> ParseCards(string[] cardStrs)
    {
        var cards = new List<Card>();
        foreach (var s in cardStrs)
            cards.Add(ParseCard(s));
        return cards;
    }

    private static Card ParseCard(string notation)
    {
        var rankChar = notation[..^1];
        var suitChar = notation[^1];

        CardRank rank = rankChar switch
        {
            "A" => CardRank.Ace,
            "K" => CardRank.King,
            "Q" => CardRank.Queen,
            "J" => CardRank.Jack,
            "10" => CardRank.Ten,
            "9" => CardRank.Nine,
            "8" => CardRank.Eight,
            "7" => CardRank.Seven,
            "6" => CardRank.Six,
            "5" => CardRank.Five,
            "4" => CardRank.Four,
            "3" => CardRank.Three,
            "2" => CardRank.Two,
            _ => throw new Exception("Invalid rank: " + rankChar)
        };

        Suit suit = suitChar switch
        {
            '♠' => Suit.Spades,
            '♥' => Suit.Hearts,
            '♦' => Suit.Diamonds,
            '♣' => Suit.Clubs,
            _ => throw new Exception("Invalid suit: " + suitChar)
        };

        return new Card(suit, rank, GameType.Poker);
    }
}
