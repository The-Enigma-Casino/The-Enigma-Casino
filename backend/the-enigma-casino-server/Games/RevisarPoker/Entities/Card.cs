using BlackJackGame.Enum;

namespace BlackJackGame.Entities;

public class Card
{
    public Suit Suit { get; }
    public CardRank Rank { get; }

    public GameType GameType { get; set; }

    public int Value {  get; private set; }

    public Card(Suit suit, CardRank rank, GameType gameType)
    {
        Suit = suit;
        Rank = rank;
        GameType = gameType;
        SetValue();
    }

    private void SetValue()
    {
        if (GameType == GameType.BlackJack)
        {
            Value = Rank switch
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
            Value = (int)Rank;
        }
    }

    public override string ToString() => $"{Rank} of {Suit}";
}