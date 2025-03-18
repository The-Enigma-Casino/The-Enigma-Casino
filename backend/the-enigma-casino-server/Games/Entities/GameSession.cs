using the_enigma_casino_server.Games.Entities.Enum;

namespace the_enigma_casino_server.Games.Entities;

public class GameSession
{
    public int Id { get; set; }

    public GameType GameType { get; set; }

    public int? DeckId { get; set; }

    public Deck Deck { get; set; }

    public int MaxPlayer  { get; set; }
    
    public int MinPlayer { get; set; }

    public GameState GameState { get; set; }

    public List<Player> Players { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime EndedAt { get; set; }

    public GameSession()
    {
        Players = new List<Player>();
        GameState = GameState.Waiting;
        CreatedAt = DateTime.Now;
    }

}
