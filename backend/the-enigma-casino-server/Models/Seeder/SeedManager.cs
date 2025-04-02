using the_enigma_casino_server.Models.Database;
using the_enigma_casino_server.Models.Seeder.GameSeeders;

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

        GameTableSeeder gameTableSeeder = new GameTableSeeder(_context);
        gameTableSeeder.Seed();

#if DEBUG
        GameHistorySeeder gameHistorySeeder = new GameHistorySeeder(_context);
        gameHistorySeeder.Seed();
#endif
    }
}
