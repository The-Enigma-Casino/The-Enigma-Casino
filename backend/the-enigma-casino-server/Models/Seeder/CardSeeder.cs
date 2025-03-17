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
        var existingCards = _context.Cards.AsNoTracking().ToList();

        List<Card> newCards = new List<Card>();

        foreach (Suit suit in Enum.GetValues(typeof(Suit)))
        {
            foreach (CardRank rank in Enum.GetValues(typeof(CardRank)))
            {
                if (!existingCards.Any(c => c.Name == rank && c.Suit == suit))
                {
                    newCards.Add(new Card(rank, suit));
                }
            }
        }

        if (newCards.Count > 0)
        {
            _context.Cards.AddRange(newCards);
            _context.SaveChanges();
            Console.WriteLine($"{newCards.Count} cartas insertadas correctamente en la base de datos.");
        }
        else
        {
            Console.WriteLine("Todas las cartas ya existen en la base de datos.");
        }
    }
}
