using the_enigma_casino_server.Core.Entities;

namespace the_enigma_casino_server.Games.Shared.Entities;

public class UserSession
{
    public User User { get; set; }
    public int UserId { get; set; }
    public int GameTableId { get; set; }

    public int StartingChips { get; set; }
    public int EndingChips { get; set; }

    public int ChipResult => EndingChips - StartingChips;

    public DateTime JoinedAt { get; set; } = DateTime.Now;
    public DateTime LeftAt { get; set; }

    public UserSession(int gameTableId, User user)
    {
        UserId = user.Id;
        GameTableId = gameTableId;
        StartingChips = user.Coins;
        User = user;
    }

    public void CalculateEndingChips()
    {
        EndingChips = User.Coins;
    }
}



