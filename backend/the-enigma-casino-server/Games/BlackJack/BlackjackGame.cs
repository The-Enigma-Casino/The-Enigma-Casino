using the_enigma_casino_server.Games.Shared.Entities;
using the_enigma_casino_server.Games.Shared.Enum;

namespace the_enigma_casino_server.Games.BlackJack;

public class BlackjackGame
{

    private Dictionary<int, int> _lastBetAmounts = new();

    private Match _gameMatch { get; set; }
    private Deck Deck { get; set; }
    public int CurrentPlayerTurnId { get; private set; }


    public BlackjackGame(Match gameMatch)
    {
        _gameMatch = gameMatch;
        Deck = new Deck(GameType.BlackJack);
        Deck.Shuffle();
    }

    public void StartRound()
    {
        ResetHands();

        foreach (Player player in _gameMatch.Players)
        {
            _lastBetAmounts[player.UserId] = player.CurrentBet;
            player.Hand.AddCard(Deck.Draw());
            player.Hand.AddCard(Deck.Draw());
        }

        _gameMatch.GameTable.Croupier.Hand.AddCard(Deck.Draw());
        _gameMatch.GameTable.Croupier.Hand.AddCard(Deck.Draw());

        foreach (Player player in _gameMatch.Players)
        {
            if (player.Hand.GetTotal() == 21 && player.Hand.Cards.Count == 2)
            {
                player.PlayerState = PlayerState.Blackjack;
            }
        }

        var playingPlayers = _gameMatch.Players
            .Where(p => p.PlayerState == PlayerState.Playing)
            .ToList();

        if (playingPlayers.Count > 0)
        {
            var random = new Random();
            var randomPlayer = playingPlayers[random.Next(playingPlayers.Count)];
            SetCurrentPlayer(randomPlayer.UserId);
        }
        else
        {
            Console.WriteLine("❌ No hay jugadores activos para iniciar turno.");
        }
    }


    public void PlayerHit(Player player)
    {
        if (player.PlayerState == PlayerState.Stand)
        {
            Console.WriteLine($"{player.User.NickName} se ha plantado y no puede tomar más cartas.");
            return;
        }

        if (player.PlayerState == PlayerState.Bust)
        {
            Console.WriteLine($"{player.User.NickName} ya ha perdido y no puede tomar más cartas.");
            return;
        }

        if (player.PlayerState == PlayerState.Blackjack)
        {
            Console.WriteLine($"{player.User.NickName} tiene Blackjack y no puede actuar.");
            return;
        }

        if (player.Hand.GetTotal() >= 21 && (player.PlayerState != PlayerState.Blackjack))
        {
            Console.WriteLine($"{player.User.NickName} ya ha alcanzado 21 o más y no puede tomar más cartas.");
            return;
        }

        player.Hand.AddCard(Deck.Draw());

        if (player.Hand.IsBusted())
        {
            player.PlayerState = PlayerState.Bust;
            Console.WriteLine($"{player.User.NickName} se ha pasado (Bust).");
        }
    }

    public void CroupierTurn()
    {
        bool anyPlayerUnder21 = false;

        foreach (Player player in _gameMatch.Players)
        {
            if (player.Hand.GetTotal() <= 21)
            {
                anyPlayerUnder21 = true;
            }
        }

        while (_gameMatch.GameTable.Croupier.Hand.GetTotal() < 17 && anyPlayerUnder21)
        {
            _gameMatch.GameTable.Croupier.Hand.AddCard(Deck.Draw());
        }
    }

    public List<object> Evaluate()
    {
        var results = new List<object>();
        int croupierTotal = _gameMatch.GameTable.Croupier.Hand.GetTotal();
        bool dealerBust = _gameMatch.GameTable.Croupier.Hand.IsBusted();

        var playersSnapshot = _gameMatch.Players
            .Where(p => p.PlayerState != PlayerState.Spectating)
            .ToList();

        foreach (Player player in playersSnapshot)
        {
            int playerTotal = player.Hand.GetTotal();
            bool playerBust = player.Hand.IsBusted();
            string result = "";
            int coinsChange = 0;
            int originalBet = player.CurrentBet;

            bool playerHasBlackjack = player.PlayerState == PlayerState.Blackjack;
            bool dealerHasBlackjack = croupierTotal == 21 && _gameMatch.GameTable.Croupier.Hand.Cards.Count == 2;

            if (playerHasBlackjack && dealerHasBlackjack)
            {
                player.Draw();
                result = "draw";
                coinsChange = 0;
            }
            else if (playerHasBlackjack)
            {
                coinsChange = (int)(originalBet * 1.5);
                result = "blackjack";
                WinBlackjack(player);
            }
            else if (playerBust)
            {
                coinsChange = -originalBet;
                result = "lose";
                player.Bust();
            }
            else if (playerTotal < croupierTotal && !dealerBust)
            {
                coinsChange = -originalBet;
                result = "lose";
                player.Lose();
            }
            else if (dealerBust || playerTotal > croupierTotal)
            {
                coinsChange = originalBet;
                result = "win";
                player.Win(originalBet * 2);
            }
            else if (playerTotal == croupierTotal && !(dealerHasBlackjack && !playerHasBlackjack))
            {
                coinsChange = 0;
                result = "draw";
                player.Draw();
            }
            else if (dealerHasBlackjack && !playerHasBlackjack)
            {
                coinsChange = -originalBet;
                result = "lose";
                player.Lose();
            }

            results.Add(new
            {
                userId = player.UserId,
                nickname = player.User.NickName,
                result,
                coinsChange,
                finalTotal = playerTotal
            });
        }

        return results;
    }


    private void WinBlackjack(Player player)
    {
        double amount = player.CurrentBet * 2.5;
        int roundedAmount = (int)Math.Floor(amount);
        player.Win(roundedAmount);
    }

    public void DoubleDown(Player player)
    {
        if (player.PlayerState != PlayerState.Playing) return;
        
        int doubleBet = player.CurrentBet * 2;

        if (doubleBet > player.User.Coins) return;

        player.User.Coins -= player.CurrentBet;
        player.CurrentBet = doubleBet;
        _lastBetAmounts[player.UserId] = doubleBet;

        PlayerHit(player);

        player.PlayerState = PlayerState.Stand;

    }


    public void ResetHands()
    {
        foreach (Player player in _gameMatch.Players)
        {
            player.PlayerState = PlayerState.Playing;
            player.Hand = new Hand();
        }
        _gameMatch.GameTable.Croupier.Hand = new Hand();
        Deck = new Deck(GameType.BlackJack);
        Deck.Shuffle();
    }


    public Card GetCroupierVisibleCard()
    {
        return _gameMatch.GameTable.Croupier.Hand.Cards.First();
    }


    public void SetCurrentPlayer(int userId)
    {
        CurrentPlayerTurnId = userId;

        Player player = _gameMatch.Players.FirstOrDefault(p => p.UserId == userId);
        if (player != null && player.PlayerState == PlayerState.Playing)
        {
            player.PlayerState = PlayerState.Playing;
        }
        else if (player?.PlayerState == PlayerState.Blackjack)
        {
            Console.WriteLine($"⏭️ {player.User.NickName} tiene Blackjack, se omite turno.");
        }
    }

    public int GetLastBetAmount(int userId)
    {
        return _lastBetAmounts.TryGetValue(userId, out int amount) ? amount : 0;
    }

}