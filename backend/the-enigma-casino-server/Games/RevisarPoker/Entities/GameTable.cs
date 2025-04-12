using BlackJackGame.Enum;
using System.ComponentModel.DataAnnotations.Schema;


namespace BlackJackGame.Entities;

public class GameTable
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

    public GameTable()
    {

    }

    public GameTable(GameType gameType)
    {
        GameType = gameType;
    }

    public bool AddPlayer(Player player) //Modificado para que controle si la mesa esta llena
    {
        if (Players.Count >= MaxPlayer)
        {
            Console.WriteLine("La mesa ya está llena.");
            return false;
        }

        Players.Add(player);
        Console.WriteLine("{player.User.NickName} se ha unido a la mesa.");
        return true;
    }

}