using BlackJackGame.Enum;

namespace BlackJackGame.Entities;


public class Player
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User User { get; set; }
    public Hand Hand { get; set; } = new();
    public int GameTableId { get; set; }
    public GameTable? GameTable { get; set; }
    public int? GameMatchId { get; set; }
    public GameMatch? GameMatch { get; set; }
    public PlayerState PlayerState { get; set; } = PlayerState.Waiting;
    public int CurrentBet { get; set; }
    public int TotalContribution { get; set; } = 0;


    public Player(User user)
    {
        User = user;
        UserId = user.Id;
        Id = User.Id;

    }

    public void PlaceBet(int amount, bool allowAllIn = false) // Deberia funcionar en BlackJack y Poker
    {
        if (amount > User.Coins)
        {
            if (!allowAllIn)
                throw new InvalidOperationException("Not enough balance.");

            amount = User.Coins;
            PlayerState = PlayerState.AllIn;
        }
        else if (amount == User.Coins && allowAllIn)
        {
            PlayerState = PlayerState.AllIn;
        }

        CurrentBet += amount;
        TotalContribution += amount;
        User.Coins -= amount;
    }

    public void Win(int amount)
    {
        User.Coins += amount;
        PlayerState = PlayerState.Win;
        CurrentBet = 0;
    }

    public void Stand()
    {
        PlayerState = PlayerState.Stand;
    }
}
