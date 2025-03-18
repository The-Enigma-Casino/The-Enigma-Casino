namespace the_enigma_casino_server.Games.Entities;

public class Deck
{
    public int Id { get; set; }

    public int GameSessionId { get; set; }

    public GameSession GameSession { get; set; }

    public List<Card> Cards { get; set; }

    public Deck()
    {
        Cards = new List<Card>();
    }

}
