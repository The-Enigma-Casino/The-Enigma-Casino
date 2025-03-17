using the_enigma_casino_server.Games.Entities.Enum;
using the_enigma_casino_server.Models.Database.Entities;

namespace the_enigma_casino_server.Games.Entities;

public class Player
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public User User { get; set; }

    public int BetCoins { get; set; }

    public int GameId { get; set; }

    public GameType GameType { get; set; }

    public PlayerState PlayerState { get; set; }

    public string AdditionalInfo { get; set; }

    public Player()
    {
        BetCoins = 0;
        PlayerState = PlayerState.Waiting;
        AdditionalInfo = "{}";
    }
}
