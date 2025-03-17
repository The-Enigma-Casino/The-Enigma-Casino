namespace the_enigma_casino_server.Games.BlackJack.Entities;

public class Deck
{
    public List<Card> Cards { get; set; }

    public Deck()
    {
        Cards = new List<Card>();
        foreach (Suit suit in Enum.GetValues(typeof(Suit)))
        {
            foreach (CardRank rank in Enum.GetValues(typeof(CardRank)))
            {
                Cards.Add(new Card(rank, suit));
            }
        }
    }

}
