

using the_enigma_casino_server.Games.Shared.Entities;
using the_enigma_casino_server.Games.Shared.Entities.Enum;



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

    public void CreateDeck()
    {
        foreach (Suit suit in Enum.GetValues(typeof(Suit)))
        {
            foreach (CardRank rank in Enum.GetValues(typeof(CardRank)))
            {
                Cards.Add(new Card(rank, suit));
            }
        }
    }

    public void Shuffle()
    {
        Random random = new Random();
        int remainingCards = Cards.Count;

        while (remainingCards > 1)
        {
            remainingCards--;
            int randomIndex = random.Next(remainingCards + 1);
            Card value = Cards[randomIndex];
            Cards[randomIndex] = Cards[remainingCards];
            Cards[remainingCards] = value;
        }
    }

    public Card DrawCard()
    {
        if (Cards.Count == 0)
            throw new Exception("No quedan cartas en el mazo.");

        Card card = Cards[0];
        Cards.RemoveAt(0);

        return card;
    }

}
