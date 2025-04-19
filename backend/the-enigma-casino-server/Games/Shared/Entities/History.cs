using System.ComponentModel.DataAnnotations.Schema;
using the_enigma_casino_server.Core.Entities;
using the_enigma_casino_server.Games.Shared.Enum;

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

    public DateTime JoinedAt { get; set; } = DateTime.Now;

    public DateTime? LeftAt { get; set; }
    public int? LastMatchIdProcessed { get; set; }
}
