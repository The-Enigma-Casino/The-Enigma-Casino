using the_enigma_casino_server.Games.Shared.Entities.Enum;
using the_enigma_casino_server.Models.Database.Entities;

namespace the_enigma_casino_server.Games.Shared.Entities;

public class Player
{
    public int Id { get; set; }

    public int UserId { get; set; }
    public User User { get; set; }

    public int GameTableId { get; set; }
    public GameTable GameTable { get; set; }

    public int? GameMatchId { get; set; }
    public GameMatch? GameMatch { get; set; }

    public PlayerState PlayerState { get; set; } = PlayerState.Waiting;

}
