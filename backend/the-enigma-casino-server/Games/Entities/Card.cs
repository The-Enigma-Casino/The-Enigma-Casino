using the_enigma_casino_server.Games.Entities.Enum;

namespace the_enigma_casino_server.Games.Entities;

public class Card
{
    public int Id { get; set; }

    public Suit Suit { get; set; }

    public CardRank CardRank { get; set; }

    public string ImageUrl { get; set; }

    public int DefaultValue { get; set; }

    public GameType GameType { get; set; }

    private Card() { }

    public Card(CardRank name, Suit suit)
    {
        CardRank = name;
        Suit = suit;
        ImageUrl = GenerateImageUrl(name, suit);
    }

    public Card(CardRank name, Suit suit, GameType gameType) : this(name, suit)
    {
        GameType = gameType;
        DefaultValue = GetDefaultValue(name, gameType);
    }

    public static string GenerateImageUrl(CardRank name, Suit suit)
    {
        return $"/images/cards/{name.ToString().ToLower()}_{suit.ToString().ToLower()}.webp";
    }

    public int GetDefaultValue(CardRank cardRank, GameType gameType)
    {
        if (gameType == GameType.BlackJack)
        {
            return cardRank switch
            {
                CardRank.Ace => 11,
                CardRank.Jack or CardRank.Queen or CardRank.King => 10,
                _ => (int)cardRank
            };
        } else if (gameType == GameType.Poker)
        {
            return (int)cardRank;
        }

        return 0;
    }
}
