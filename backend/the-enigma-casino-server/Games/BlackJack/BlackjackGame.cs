using the_enigma_casino_server.Games.Shared.Entities;
using the_enigma_casino_server.Games.Shared.Entities.Enum;

namespace the_enigma_casino_server.Games.BlackJack;

public class BlackjackGame
{
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

        foreach (var player in _gameMatch.Players)
        {
            player.Hand.AddCard(Deck.Draw());
            player.Hand.AddCard(Deck.Draw());
        }

        _gameMatch.GameTable.Croupier.Hand.AddCard(Deck.Draw());
        _gameMatch.GameTable.Croupier.Hand.AddCard(Deck.Draw());

        var playingPlayers = _gameMatch.Players
            .Where(p => p.PlayerState == PlayerState.Playing)
            .ToList();

        if (playingPlayers.Count > 0)
        {
            var random = new Random();
            var randomPlayer = playingPlayers[random.Next(playingPlayers.Count)];
            SetCurrentPlayer(randomPlayer.UserId);
            Console.WriteLine($"🎲 Turno inicial aleatorio: {randomPlayer.User.NickName} (UserId: {randomPlayer.UserId})");
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

        if (player.Hand.GetTotal() >= 21)
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

    public void Evaluate()
    {
        int croupierTotal = _gameMatch.GameTable.Croupier.Hand.GetTotal();
        bool dealerBust = _gameMatch.GameTable.Croupier.Hand.IsBusted();

        foreach (Player player in _gameMatch.GameTable.Players)
        {
            int playerTotal = player.Hand.GetTotal();
            bool playerBust = player.Hand.IsBusted();

            if (playerBust)
            {
                player.Bust();
                Console.WriteLine($"{player.User.NickName} ha perdido por pasarse.");
            }
            else if (playerTotal < croupierTotal && !dealerBust)
            {
                player.Lose();
                Console.WriteLine($"{player.User.NickName} ha perdido.");
            }
            else if (dealerBust || playerTotal > croupierTotal)
            {
                player.Win(player.CurrentBet * 2);
                Console.WriteLine($"{player.User.NickName} ha ganado.");
            }
            else if (playerTotal == croupierTotal)
            {
                player.Draw();
                Console.WriteLine($"{player.User.NickName} ha empatado.");
            }
            else if (playerTotal == 21 && player.Hand.Cards.Count == 2 && croupierTotal == 21 && _gameMatch.GameTable.Croupier.Hand.Cards.Count == 2)
            {
                player.Draw();
                Console.WriteLine($"{player.User.NickName} ha hecho Blackjack empata ganando {player.CurrentBet } monedas.");
            }
            else if (player.Hand.GetTotal() == 21 && player.Hand.Cards.Count == 2)
            {
                WinBlackjack(player);
                Console.WriteLine($"{player.User.NickName} ha hecho Blackjack y gana {player.CurrentBet * 2.5} monedas.");
            }
        }
    }

    private void WinBlackjack(Player player)
    {
        double amount = player.CurrentBet * 2.5;
        int roundedAmount = (int)Math.Floor(amount);
        player.Win(roundedAmount);
    }

    public void DoubleDown(Player player)
    {

        if (player.PlayerState != PlayerState.Playing)
        {
            Console.WriteLine($"{player.User.NickName} no puede doblar su apuesta en este momento.");
            return;
        }

        int doubleBet = player.CurrentBet * 2;

        if (doubleBet > player.User.Coins)
        {
            Console.WriteLine($"{player.User.NickName} no tiene suficientes monedas para doblar la apuesta.");
            return;
        }

        player.User.Coins -= player.CurrentBet;
        player.CurrentBet = doubleBet;

        Console.WriteLine($"{player.User.NickName} ha doblado su apuesta a {player.CurrentBet} monedas.");
        PlayerHit(player);

        player.PlayerState = PlayerState.Stand;

    }


    public void ResetHands()
    {
        foreach (var player in _gameMatch.Players)
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
    }

}