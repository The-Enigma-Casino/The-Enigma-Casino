using the_enigma_casino_server.Models.Database.Entities;

namespace the_enigma_casino_server.Games.BlackJack.Entities;

public class Player
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public User User { get; set; }

    public List<Card> Hand { get; set; } = new List<Card>();

    public int Score { get; set; }

    public int BetCoins { get; set; }

    public Player(User user)
    {
        UserId = user.Id;
        User = user;
        Score = 0;
        BetCoins = 0;
    }
}
