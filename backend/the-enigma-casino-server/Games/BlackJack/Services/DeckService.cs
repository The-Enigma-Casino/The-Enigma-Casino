using the_enigma_casino_server.Games.BlackJack.Entities;

namespace the_enigma_casino_server.Games.BlackJack.Services;

public class DeckService
{
    public void Shuffle(Deck deck)
    {
        Random random = new Random();
        int remainingCards = deck.Cards.Count;

        while (remainingCards > 1)
        {
            remainingCards--;
            int randomIndex = random.Next(remainingCards + 1);
            Card value = deck.Cards[randomIndex];
            deck.Cards[randomIndex] = deck.Cards[remainingCards];
            deck.Cards[remainingCards] = value;
        }
    }

    public Card DrawCard(Deck deck)
    {
        if (deck.Cards.Count == 0)
            throw new Exception("No quedan cartas en el mazo.");

        Card card = deck.Cards[0];
        deck.Cards.RemoveAt(0);
        return card;
    }
}
