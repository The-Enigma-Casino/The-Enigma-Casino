using Microsoft.EntityFrameworkCore;
using the_enigma_casino_server.Games.BlackJack.Entities;
using the_enigma_casino_server.Models.Database;

namespace the_enigma_casino_server.Models.Seeder;

public class CardSeeder
{
    private readonly MyDbContext _context;

    public CardSeeder(MyDbContext context)
    {
        _context = context;
    }

    public void Seed()
    {
        var existingCards = _context.Cards.ToList();

        List<Card> newCards = new List<Card>();

        foreach (Suit suit in Enum.GetValues(typeof(Suit)))
        {
            foreach (string rankName in Enum.GetNames(typeof(CardRank)))
            {
                CardRank rank = Enum.Parse<CardRank>(rankName);
                string imageUrl = $"/images/cards/{rankName.ToLower()}_{suit.ToString().ToLower()}.webp";

                var existingCard = existingCards.FirstOrDefault(c => c.Name == rank && c.Suit == suit);

                if (existingCard == null)
                {
                    var newCard = new Card(rank, suit) { ImageUrl = imageUrl };
                    newCards.Add(newCard);
                }
                else
                {

                    if (existingCard.ImageUrl != imageUrl)
                    {
                        existingCard.ImageUrl = imageUrl;
                        _context.Entry(existingCard).State = EntityState.Modified;
                    }
                }
            }
        }

        if (newCards.Count > 0)
        {
            _context.Cards.AddRange(newCards);
        }

        _context.SaveChanges();
    }
}
