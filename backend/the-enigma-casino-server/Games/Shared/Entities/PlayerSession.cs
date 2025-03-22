namespace the_enigma_casino_server.Games.Shared.Entities;

public class UserSession
{
    public int UserId { get; set; }
    public int GameTableId { get; set; }

    public int StartingChips { get; set; }
    public int EndingChips { get; set; }

    public int ChipResult => EndingChips - StartingChips;

    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
    public DateTime LeftAt { get; set; }
}

