using the_enigma_casino_server.Games.Shared.Enum;

namespace the_enigma_casino_server.Games.Shared.Entities;

public class Match
{
    public int Id { get; set; }

    public int GameTableId { get; set; }

    public Table GameTable { get; set; }

    public List<Player> Players { get; set; } = new();

    public DateTime StartedAt { get; set; }

    public DateTime? EndedAt { get; set; }

    public MatchState MatchState { get; set; } = MatchState.InProgress;

}
