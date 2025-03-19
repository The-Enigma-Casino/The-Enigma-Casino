using the_enigma_casino_server.Games.Shared.Entities.Enum;

namespace the_enigma_casino_server.Games.Shared.Entities;

public class GameSession
{
    public int Id { get; set; }

    public GameType GameType { get; set; }

    public int MaxPlayer { get; set; }

    public int MinPlayer { get; set; }

    public bool IsWaiting { get; set; }

    public List<Player> Players { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime EndedAt { get; set; }

    public GameSession()
    {
        Players = new List<Player>();
        IsWaiting = true;
        CreatedAt = DateTime.Now;
    }

}
