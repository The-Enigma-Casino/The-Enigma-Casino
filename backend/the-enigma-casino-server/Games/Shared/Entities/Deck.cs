namespace the_enigma_casino_server.Games.Shared.Entities;

public class Deck
{
    public int Id { get; set; }

    public int GameMatchId { get; set; }

    public GameMatch GameMatch { get; set; }

    public List<Card> Cards { get; set; }

    public Deck()
    {
        Cards = new List<Card>();
    }

}
