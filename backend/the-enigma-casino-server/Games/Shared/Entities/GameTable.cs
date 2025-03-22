using System.ComponentModel.DataAnnotations.Schema;
using the_enigma_casino_server.Games.Shared.Entities.Enum;

namespace the_enigma_casino_server.Games.Shared.Entities;

public class GameTable
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public GameType GameType { get; set; } 

    public int MaxPlayer { get; set; }

    public int MinPlayer { get; set; }

    public TableState TableState { get; set; } = TableState.Waiting;

    [NotMapped]
    public List<Player> ConnectedPlayers { get; set; } = new();

}
