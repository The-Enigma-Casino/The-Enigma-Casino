using System.ComponentModel.DataAnnotations.Schema;
using the_enigma_casino_server.Games.Shared.Entities.Enum;

namespace the_enigma_casino_server.Games.Shared.Entities;

public class Table
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public GameType GameType { get; set; }
    public int MaxPlayer { get; set; }
    public int MinPlayer { get; set; }

    public TableState TableState { get; set; } = TableState.Waiting;

    [NotMapped]
    public List<Player> Players { get; set; } = new();

    [NotMapped]
    public Croupier Croupier { get; set; } = new();

    public Table()
    {

    }

    public Table(GameType gameType)
    {
        GameType = gameType;
    }

    public void AddPlayer(Player player)
    {
        Players.Add(player);
    }

}
