using the_enigma_casino_server.Models.Database;

namespace the_enigma_casino_server.Models.Seeder;

public class SeedManager
{
    private readonly MyDbContext _context;

    public SeedManager(MyDbContext context)
    {
        _context = context;
    }

    public void SeedAll()
    {
        UserSeeder userSeeder = new UserSeeder(_context);
        userSeeder.Seed();

        CoinsPackSeeder coinsPackSeeder = new CoinsPackSeeder(_context);
        coinsPackSeeder.Seed();
    }
}
