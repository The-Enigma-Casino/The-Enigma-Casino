using the_enigma_casino_server.Core.Entities;
using the_enigma_casino_server.Games.Shared.Enum;

namespace the_enigma_casino_server.Games.Shared.Entities;

public class Player
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User User { get; set; }
    public Hand Hand { get; set; } = new();
    public int GameTableId { get; set; }
    public Table GameTable { get; set; }
    public Match? GameMatch { get; set; }
    public PlayerState PlayerState { get; set; } = PlayerState.Waiting;
    public int CurrentBet { get; set; }
    public DateTime? JoinedAt { get; set; }
    public bool HasAbandoned { get; set; } = false;

    public Player() { }

    public Player(User user)
    {
        User = user;
        UserId = user.Id;
        Id = User.Id;

    }

    public void PlaceBet(int amount)
    {
        if (amount > User.Coins) throw new InvalidOperationException("No tienes suficientes fichas.");
        if (amount <= 0) throw new InvalidOperationException("La apuesta debe ser mayor que cero.");
        CurrentBet += amount;
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
    public void Bust()
    {
        PlayerState = PlayerState.Bust;
    }

    public void Lose()
    {
        PlayerState = PlayerState.Lose;
        CurrentBet = 0;
    }

    public void Draw()
    {
        User.Coins += CurrentBet;
        PlayerState = PlayerState.Draw;
        CurrentBet = 0;
    }

    public void ResetForNewRound()
    {
        CurrentBet = 0;
        PlayerState = PlayerState.Waiting;
        Hand = new Hand();
        HasAbandoned = false;
    }
}
