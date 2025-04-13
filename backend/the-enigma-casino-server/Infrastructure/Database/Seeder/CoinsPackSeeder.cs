using the_enigma_casino_server.Core.Entities;

namespace the_enigma_casino_server.Infrastructure.Database.Seeder;

public class CoinsPackSeeder
{
    private readonly MyDbContext _context;

    public CoinsPackSeeder(MyDbContext context)
    {
        _context = context;
    }

    public void Seed()
    {
        if (_context.CoinsPacks.Any())
        {
            Console.WriteLine("Los pack de fichas ya existen en la base de datos, no se insertarán duplicados.");
            return;
        }

        List<CoinsPack> coinsPacks = new List<CoinsPack>
        {
            new CoinsPack
            {
                Price = 1000,
                Quantity = 100,
                Offer = 0,
                Image = "images/coins/pack1.webp",
            },

            new CoinsPack
            {
                Price = 2000,
                Quantity = 200,
                Offer = 0,
                Image = "images/coins/pack2.webp",
            },

            new CoinsPack
            {
                Price = 5000,
                Quantity = 500,
                Offer = 0,
                Image = "images/coins/pack3.webp",
            },

            new CoinsPack
            {
                Price = 10000,
                Quantity = 1000,
                Offer = 0,
                Image = "images/coins/pack4.webp",
            },

            new CoinsPack
            {
                Price = 20000,
                Quantity = 2000,
                Offer = 0,
                Image = "images/coins/pack5.webp",
            },

            new CoinsPack
            {
                Price = 50000,
                Quantity = 5000,
                Offer = 0,
                Image = "images/coins/pack6.webp",
            },
            new CoinsPack
            {
                Price = 0,
                Quantity = 0,
                Offer = 0,
                Image = "images/cards/as_clubs.webp",
            },

        };

        _context.CoinsPacks.AddRange(coinsPacks);
        _context.SaveChanges();
    }
}
