using the_enigma_casino_server.Games.Shared.Entities.Enum;
using the_enigma_casino_server.Models.Database.Entities;

namespace the_enigma_casino_server.Games.Shared.Entities;

public class History
{
    public int Id { get; set; }

    public int GameTableId { get; set; }
    public Table GameTable { get; set; }
    public int UserId { get; set; }
    public User User { get; set; }

    public GameType GameType { get; set; }

    public int TotalMatchesPlayed { get; set; }

    public int TotalBetAmount { get; set; } 

    public int ChipResult { get; set; } 

    public DateTime JoinedAt { get; set; } =  DateTime.Now;

    public DateTime? LeftAt { get; set; }
}
