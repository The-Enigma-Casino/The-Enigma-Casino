using the_enigma_casino_server.Games.Shared.Entities.Enum;

namespace the_enigma_casino_server.Games.Shared.Entities;

public class Card
{
    public int Id { get; set; }

    public Suit Suit { get; set; }

    public CardRank CardRank { get; set; }

    public string ImageUrl { get; set; }

    public int DefaultValue { get; set; }

    public GameType GameType { get; set; }

    public int Value { get; private set; }

    private Card() { }

    public Card(CardRank name, Suit suit)
    {
        CardRank = name;
        Suit = suit;
        ImageUrl = GenerateImageUrl(name, suit);
    }

    public Card(Suit suit, CardRank rank, GameType gameType)
    {
        Suit = suit;
        CardRank = rank;
        GameType = gameType;
        SetValue();
    }

    private void SetValue()
    {
        if (GameType == GameType.BlackJack)
        {
            Value = CardRank switch
            {
                CardRank.Two => 2,
                CardRank.Three => 3,
                CardRank.Four => 4,
                CardRank.Five => 5,
                CardRank.Six => 6,
                CardRank.Seven => 7,
                CardRank.Eight => 8,
                CardRank.Nine => 9,
                CardRank.Ten => 10,
                CardRank.Jack => 10,
                CardRank.Queen => 10,
                CardRank.King => 10,
                CardRank.Ace => 11,
                _ => 0
            };
        }
        else
        {
            Value = (int)CardRank;
        }
    }

    public override string ToString() => $"{CardRank} de {Suit}";

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
        }
        else if (gameType == GameType.Poker)
        {
            return (int)cardRank;
        }

        return 0;
    }
}
