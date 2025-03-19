using the_enigma_casino_server.Games.Shared.Entities;
using the_enigma_casino_server.Games.Shared.Entities.Enum;
using the_enigma_casino_server.Models.Database;

namespace the_enigma_casino_server.Games.Shared.Services;

public class DeckService
{

    private readonly UnitOfWork _unitOfWork;

    public DeckService(UnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Deck> CreateDeck(GameMatch gameMatch)
    {
        Deck deck = new Deck
        {
            GameMatchId = gameMatch.Id,
        };

        foreach (Suit suit in Enum.GetValues(typeof(Suit)))
        {
            foreach (CardRank rank in Enum.GetValues(typeof(CardRank)))
            {
                deck.Cards.Add(new Card(rank, suit));
            }
        }

        Shuffle(deck);

        await _unitOfWork.DeckRepository.InsertAsync(deck);
        await _unitOfWork.SaveAsync();

        return deck;
    }

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

    public async Task<Card> DrawCard(Deck deck)
    {
        if (deck.Cards.Count == 0)
            throw new Exception("No quedan cartas en el mazo.");

        Card card = deck.Cards[0];
        deck.Cards.RemoveAt(0);
        _unitOfWork.DeckRepository.Update(deck);
        await _unitOfWork.SaveAsync();

        return card;
    }


}
