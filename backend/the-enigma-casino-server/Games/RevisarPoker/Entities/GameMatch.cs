using BlackJackGame.Enum;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BlackJackGame.Entities;

public class GameMatch
{
    public int Id { get; set; }

    public int GameTableId { get; set; }

    public GameTable? GameTable { get; set; }

    public List<Player> Players { get; set; } = new();

    public DateTime StartedAt { get; set; }

    public DateTime? EndedAt { get; set; }

    public MatchState MatchState { get; set; } = MatchState.InProgress;

}