

using the_enigma_casino_server.Games.Shared.Entities.Enum;

namespace the_enigma_casino_server.Games.Shared.Entities;

public class Hand
{
    public List<Card> Cards { get; private set; } = new();

    public void AddCard(Card card)
    {
        Cards.Add(card);
    }

    public int GetTotal()
    {
        int total = Cards.Sum(c => c.Value);
        int aceCount = Cards.Count(c => c.Rank == CardRank.Ace);

        while (total > 21 && aceCount > 0)
        {
            total -= 10;
            aceCount--;
        }

        return total;
    }

    public bool IsBusted() => GetTotal() > 21;
}