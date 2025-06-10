using the_enigma_casino_server.Core.Entities;
using the_enigma_casino_server.Games.BlackJack;
using the_enigma_casino_server.Games.Shared.Entities;
using the_enigma_casino_server.Games.Shared.Enum;

namespace the_enigma_casino_server.Tests;

public static class BlackjackTest
{
    public static void Run()
    {
        Console.WriteLine("🧪 Test: Jugador con 21 (3 cartas) vs Crupier con Blackjack");

        Player jugador = new Player(new User { Id = 1, NickName = "Jugador", Coins = 1000 })
        {
            CurrentBet = 100,
            PlayerState = PlayerState.Playing,
            Hand = new Hand()
        };
        jugador.Hand.AddCard(new Card(Suit.Hearts, CardRank.Seven, GameType.BlackJack));
        jugador.Hand.AddCard(new Card(Suit.Spades, CardRank.Six, GameType.BlackJack));
        jugador.Hand.AddCard(new Card(Suit.Diamonds, CardRank.Eight, GameType.BlackJack));

        Croupier crupier = new Croupier()
        {
            Hand = new Hand()
        };
        crupier.Hand.AddCard(new Card(Suit.Spades, CardRank.Ace, GameType.BlackJack));
        crupier.Hand.AddCard(new Card(Suit.Hearts, CardRank.King, GameType.BlackJack));

        Table table = new Table
        {
            Croupier = crupier,
            Players = new List<Player> { jugador }
        };

        var match = new Match
        {
            GameTable = table,
            Players = new List<Player> { jugador }
        };

        BlackjackGame game = new BlackjackGame(match);
        List<object> results = game.Evaluate();

        Console.WriteLine("🎯 Resultado del test:");
        foreach (var result in results)
        {
            Console.WriteLine(Newtonsoft.Json.JsonConvert.SerializeObject(result, Newtonsoft.Json.Formatting.Indented));
        }
    }
}
