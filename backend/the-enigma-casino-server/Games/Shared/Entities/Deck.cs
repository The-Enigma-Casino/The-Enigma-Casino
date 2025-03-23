using the_enigma_casino_server.Games.Shared.Entities;
using the_enigma_casino_server.Games.Shared.Entities.Enum;

public class Deck
{
    private List<Card> _cards;

    private GameType _gameType;

    public Deck(GameType gameType)
    {
        _gameType = gameType;
        _cards = new List<Card>();
        foreach (Suit suit in Enum.GetValues(typeof(Suit)))
        {
            foreach (CardRank rank in Enum.GetValues(typeof(CardRank)))
            {
                _cards.Add(new Card(suit, rank, _gameType));
            }
        }
    }

    public void Shuffle()
    {
        Random random = new();
        _cards = _cards.OrderBy(x => random.Next()).ToList();
    }

    public Card Draw()
    {
        if (_cards.Count == 0) throw new InvalidOperationException("Deck is empty.");
        Card card = _cards[0];
        _cards.RemoveAt(0);
        return card;
    }

}
