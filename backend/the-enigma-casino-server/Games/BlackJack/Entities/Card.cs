namespace the_enigma_casino_server.Games.BlackJack.Entities;

public class Card
{
    public int Id { get; set; }

    public Suit Suit { get; set; }
    
    public CardRank Name { get; set; }

    public string ImageUrl { get; set; }

    // 🔹 Constructor vacío para Entity Framework
    private Card() { }

    public Card(CardRank name, Suit suit)
    {
        Name = name;
        Suit = suit;
        ImageUrl = GenerateImageUrl(name, suit);
    }

    // 🔹 Método estático para asegurarnos de que la URL siempre se genera bien
    public static string GenerateImageUrl(CardRank name, Suit suit)
    {
        return $"/images/cards/{name.ToString().ToLower()}_{suit.ToString().ToLower()}.webp";
    }
    public int GetValue()
    {
        return (int)Name;
    }

}
