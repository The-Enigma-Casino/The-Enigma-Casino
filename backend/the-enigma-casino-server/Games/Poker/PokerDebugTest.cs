using the_enigma_casino_server.Core.Entities;
using the_enigma_casino_server.Games.Poker;
using the_enigma_casino_server.Games.Shared.Entities;
using the_enigma_casino_server.Games.Shared.Enum;
using the_enigma_casino_server.WebSockets.Poker;
using System.Reflection;

public static class PokerDebugTest
{
    public static void RunAllEdgeCaseTests()
    {
        Test_AllInShortStack();
        Test_SidePotsMultipleAllIn();
        Test_SidePotTie();
        Test_PlayerLeavesBeforeShowdown();
        Test_ThreePlayersGame();
        Test_WheelStraight();
    }

    public static void Test_AllInShortStack()
    {
        Console.WriteLine("== Test: All-in con pocas fichas ==");

        var player1 = NewPlayer("Player1", 1, 50);  // Pocas fichas
        var player2 = NewPlayer("Player2", 2, 1000);

        var game = CreateGame(player1, player2);

        SetCommunityCards(game, new List<Card>
    {
        new Card(Suit.Hearts, CardRank.Ten, GameType.Poker),
        new Card(Suit.Clubs, CardRank.Ten, GameType.Poker),
        new Card(Suit.Diamonds, CardRank.Two, GameType.Poker),
        new Card(Suit.Spades, CardRank.Ace, GameType.Poker),
        new Card(Suit.Hearts, CardRank.King, GameType.Poker),
    });

        player1.Hand.AddCard(new Card(Suit.Hearts, CardRank.Two, GameType.Poker));
        player1.Hand.AddCard(new Card(Suit.Spades, CardRank.Three, GameType.Poker));

        player2.Hand.AddCard(new Card(Suit.Clubs, CardRank.Ten, GameType.Poker));
        player2.Hand.AddCard(new Card(Suit.Diamonds, CardRank.King, GameType.Poker));

        // Estado correcto: Player1 está all-in
        player1.PlayerState = PlayerState.AllIn;
        player2.PlayerState = PlayerState.Playing;

        player1.CurrentBet = 50;
        player2.CurrentBet = 100;

        PokerBetTracker.RegisterBet(player1.GameTableId, player1.UserId, 50);
        PokerBetTracker.RegisterBet(player2.GameTableId, player2.UserId, 100);

        game.GeneratePots();
        game.Showdown();
    }


    public static void Test_SidePotsMultipleAllIn()
    {
        Console.WriteLine("== Test: Side pots con múltiples all-in ==");

        var player1 = NewPlayer("Player1", 1, 50);
        var player2 = NewPlayer("Player2", 2, 100);
        var player3 = NewPlayer("Player3", 3, 1000);

        var game = new PokerGame(new List<Player> { player1, player2, player3 }, dealerUserId: 1);

        SetCommunityCards(game, new List<Card>
        {
            new Card(Suit.Hearts, CardRank.Queen, GameType.Poker),
            new Card(Suit.Clubs, CardRank.Jack, GameType.Poker),
            new Card(Suit.Diamonds, CardRank.Ten, GameType.Poker),
            new Card(Suit.Spades, CardRank.Nine, GameType.Poker),
            new Card(Suit.Hearts, CardRank.Eight, GameType.Poker),
        });

        player1.Hand.AddCard(new Card(Suit.Hearts, CardRank.Ace, GameType.Poker));
        player1.Hand.AddCard(new Card(Suit.Spades, CardRank.Two, GameType.Poker));

        player2.Hand.AddCard(new Card(Suit.Clubs, CardRank.Ace, GameType.Poker));
        player2.Hand.AddCard(new Card(Suit.Diamonds, CardRank.Three, GameType.Poker));

        player3.Hand.AddCard(new Card(Suit.Hearts, CardRank.Ace, GameType.Poker));
        player3.Hand.AddCard(new Card(Suit.Spades, CardRank.Four, GameType.Poker));

        player1.CurrentBet = 50;
        player2.CurrentBet = 100;
        player3.CurrentBet = 1000;

        player1.PlayerState = PlayerState.AllIn;
        player2.PlayerState = PlayerState.AllIn;
        player3.PlayerState = PlayerState.Playing;

        PokerBetTracker.RegisterBet(player1.GameTableId, player1.UserId, 50);
        PokerBetTracker.RegisterBet(player2.GameTableId, player2.UserId, 100);
        PokerBetTracker.RegisterBet(player3.GameTableId, player3.UserId, 1000);

        game.GeneratePots();
        game.Showdown();
    }

    public static void Test_SidePotTie()
    {
        Console.WriteLine("== Test: Empate en side pots ==");

        var player1 = NewPlayer("Player1", 1, 100);
        var player2 = NewPlayer("Player2", 2, 100);
        var player3 = NewPlayer("Player3", 3, 100);

        var game = new PokerGame(new List<Player> { player1, player2, player3 }, dealerUserId: 1);

        SetCommunityCards(game, new List<Card>
        {
            new Card(Suit.Spades, CardRank.King, GameType.Poker),
            new Card(Suit.Hearts, CardRank.King, GameType.Poker),
            new Card(Suit.Clubs, CardRank.Ten, GameType.Poker),
            new Card(Suit.Diamonds, CardRank.Ten, GameType.Poker),
            new Card(Suit.Hearts, CardRank.Four, GameType.Poker),
        });

        player1.Hand.AddCard(new Card(Suit.Spades, CardRank.Two, GameType.Poker));
        player1.Hand.AddCard(new Card(Suit.Hearts, CardRank.Two, GameType.Poker));

        player2.Hand.AddCard(new Card(Suit.Clubs, CardRank.Two, GameType.Poker));
        player2.Hand.AddCard(new Card(Suit.Diamonds, CardRank.Two, GameType.Poker));

        player3.Hand.AddCard(new Card(Suit.Spades, CardRank.Ten, GameType.Poker));
        player3.Hand.AddCard(new Card(Suit.Hearts, CardRank.Jack, GameType.Poker));

        player1.CurrentBet = 50;
        player2.CurrentBet = 100;
        player3.CurrentBet = 100;

        player1.PlayerState = PlayerState.AllIn;
        player2.PlayerState = PlayerState.AllIn;
        player3.PlayerState = PlayerState.Playing;

        PokerBetTracker.RegisterBet(player1.GameTableId, player1.UserId, 50);
        PokerBetTracker.RegisterBet(player2.GameTableId, player2.UserId, 100);
        PokerBetTracker.RegisterBet(player3.GameTableId, player3.UserId, 100);

        game.GeneratePots();
        game.Showdown();
    }

    public static void Test_PlayerLeavesBeforeShowdown()
    {
        Console.WriteLine("== Test: Jugador abandona antes del showdown ==");

        var player1 = NewPlayer("Player1", 1, 1000);
        var player2 = NewPlayer("Player2", 2, 1000);

        var game = CreateGame(player1, player2);

        SetCommunityCards(game, new List<Card>
        {
            new Card(Suit.Hearts, CardRank.Ace, GameType.Poker),
            new Card(Suit.Clubs, CardRank.King, GameType.Poker),
            new Card(Suit.Diamonds, CardRank.Queen, GameType.Poker),
            new Card(Suit.Spades, CardRank.Jack, GameType.Poker),
            new Card(Suit.Hearts, CardRank.Ten, GameType.Poker),
        });

        player1.Hand.AddCard(new Card(Suit.Hearts, CardRank.Two, GameType.Poker));
        player1.Hand.AddCard(new Card(Suit.Spades, CardRank.Three, GameType.Poker));

        player2.Hand.AddCard(new Card(Suit.Clubs, CardRank.Four, GameType.Poker));
        player2.Hand.AddCard(new Card(Suit.Diamonds, CardRank.Five, GameType.Poker));

        player1.PlayerState = PlayerState.Playing;
        player2.PlayerState = PlayerState.Left;

        player1.CurrentBet = 100;
        player2.CurrentBet = 100;

        PokerBetTracker.RegisterBet(player1.GameTableId, player1.UserId, 100);
        PokerBetTracker.RegisterBet(player2.GameTableId, player2.UserId, 100);

        game.GeneratePots();
        game.Showdown();
    }

    public static void Test_ThreePlayersGame()
    {
        Console.WriteLine("== Test: Tres jugadores en partida ==");

        var player1 = NewPlayer("Player1", 1, 1000);
        var player2 = NewPlayer("Player2", 2, 1000);
        var player3 = NewPlayer("Player3", 3, 1000);

        var game = new PokerGame(new List<Player> { player1, player2, player3 }, dealerUserId: 1);

        SetCommunityCards(game, new List<Card>
        {
            new Card(Suit.Clubs, CardRank.Queen, GameType.Poker),
            new Card(Suit.Hearts, CardRank.Jack, GameType.Poker),
            new Card(Suit.Diamonds, CardRank.Ten, GameType.Poker),
            new Card(Suit.Spades, CardRank.Nine, GameType.Poker),
            new Card(Suit.Hearts, CardRank.Eight, GameType.Poker),
        });

        player1.Hand.AddCard(new Card(Suit.Hearts, CardRank.Ace, GameType.Poker));
        player1.Hand.AddCard(new Card(Suit.Spades, CardRank.Two, GameType.Poker));

        player2.Hand.AddCard(new Card(Suit.Clubs, CardRank.Ace, GameType.Poker));
        player2.Hand.AddCard(new Card(Suit.Diamonds, CardRank.Three, GameType.Poker));

        player3.Hand.AddCard(new Card(Suit.Hearts, CardRank.Ace, GameType.Poker));
        player3.Hand.AddCard(new Card(Suit.Spades, CardRank.Four, GameType.Poker));

        player1.CurrentBet = 100;
        player2.CurrentBet = 100;
        player3.CurrentBet = 100;

        player1.PlayerState = PlayerState.Playing;
        player2.PlayerState = PlayerState.Playing;
        player3.PlayerState = PlayerState.Playing;

        PokerBetTracker.RegisterBet(player1.GameTableId, player1.UserId, 100);
        PokerBetTracker.RegisterBet(player2.GameTableId, player2.UserId, 100);
        PokerBetTracker.RegisterBet(player3.GameTableId, player3.UserId, 100);

        game.GeneratePots();
        game.Showdown();
    }

    public static void Test_WheelStraight()
    {
        Console.WriteLine("== Test: Escalera con As bajo (Wheel) ==");

        var player1 = NewPlayer("Player1", 1, 1000);
        var player2 = NewPlayer("Player2", 2, 1000);

        var game = CreateGame(player1, player2);

        SetCommunityCards(game, new List<Card>
        {
            new Card(Suit.Hearts, CardRank.Two, GameType.Poker),
            new Card(Suit.Clubs, CardRank.Three, GameType.Poker),
            new Card(Suit.Diamonds, CardRank.Four, GameType.Poker),
            new Card(Suit.Spades, CardRank.Five, GameType.Poker),
            new Card(Suit.Hearts, CardRank.King, GameType.Poker),
        });

        player1.Hand.AddCard(new Card(Suit.Hearts, CardRank.Ace, GameType.Poker));
        player1.Hand.AddCard(new Card(Suit.Spades, CardRank.Seven, GameType.Poker));

        player2.Hand.AddCard(new Card(Suit.Clubs, CardRank.Two, GameType.Poker));
        player2.Hand.AddCard(new Card(Suit.Diamonds, CardRank.Six, GameType.Poker));

        RunTest(game, player1, player2);
    }

    private static Player NewPlayer(string name, int id, int coins) =>
        new Player(new User { Id = id, NickName = name, Coins = coins }) { GameTableId = 1 };

    private static PokerGame CreateGame(Player p1, Player p2) =>
        new PokerGame(new List<Player> { p1, p2 }, dealerUserId: p1.UserId);

    private static void SetCommunityCards(PokerGame game, List<Card> cards)
    {
        var field = typeof(PokerGame).GetField("_communityCards", BindingFlags.NonPublic | BindingFlags.Instance);
        field?.SetValue(game, cards);
    }

    private static void RunTest(PokerGame game, Player p1, Player p2)
    {
        p1.PlayerState = PlayerState.Playing;
        p2.PlayerState = PlayerState.Playing;

        p1.CurrentBet = 100;
        p2.CurrentBet = 100;

        PokerBetTracker.RegisterBet(p1.GameTableId, p1.UserId, 100);
        PokerBetTracker.RegisterBet(p2.GameTableId, p2.UserId, 100);

        game.GeneratePots();
        game.Showdown();
    }
}
