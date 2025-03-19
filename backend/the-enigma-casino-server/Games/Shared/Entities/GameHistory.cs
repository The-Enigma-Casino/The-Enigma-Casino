using the_enigma_casino_server.Games.Shared.Entities.Enum;

namespace the_enigma_casino_server.Games.Shared.Entities;

public class GameHistory
{
    public int Id { get; set; }

    public int GameSessionId { get; set; }
    public GameSession GameSession { get; set; }

    public int PlayerId { get; set; }
    public Player Player { get; set; }

    public GameType GameType { get; set; }

    public int BetAmount { get; set; }
    public DateTime Timestamp { get; set; }

    public GameHistory()
    {
        Timestamp = DateTime.UtcNow;
    }
}
