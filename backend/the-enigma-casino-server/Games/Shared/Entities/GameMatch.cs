using the_enigma_casino_server.Games.Shared.Entities.Enum;

namespace the_enigma_casino_server.Games.Shared.Entities;

public class GameMatch
{
    public int Id { get; set; }
    public int GameSessionId { get; set; }
    public GameSession GameSession { get; set; }
    public GameState GameState { get; set; } // Waiting, InProgress, Finished
    public DateTime StartedAt { get; set; }
    public DateTime? EndedAt { get; set; }

    public List<Player> Players { get; set; }
    public int? DeckId { get; set; }
    public Deck Deck { get; set; }

    public GameMatch()
    {
        Players = new List<Player>();
        GameState = GameState.Waiting;
        StartedAt = DateTime.UtcNow;
    }
}
