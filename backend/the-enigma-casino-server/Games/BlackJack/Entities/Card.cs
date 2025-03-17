namespace the_enigma_casino_server.Games.BlackJack.Entities;

public class Card
{
    public int Id { get; set; }

    public Suit Suit { get; set; }
    
    public CardRank Name { get; set; }

    public string ImageUrl { get; set; }

    public Card(CardRank name, Suit suit)
    {
        Name = name;
        Suit = suit;
        ImageUrl = $"/images/cards/{name.ToString().ToLower()}_{suit.ToString().ToLower()}.webp";
    }

    public int GetValue()
    {
        return (int)Name;
    }

}
