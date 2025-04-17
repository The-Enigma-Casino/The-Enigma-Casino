using the_enigma_casino_server.Application.Services;
using the_enigma_casino_server.Infrastructure.Database;
using the_enigma_casino_server.Infrastructure.Database.Seeder.GameSeeders;

namespace the_enigma_casino_server.Infrastructure.Database.Seeder;

public class SeedManager
{
    private readonly MyDbContext _context;
    private readonly UserService _userService;

    public SeedManager(MyDbContext context, UserService userService)
    {
        _context = context;
        _userService = userService;
    }

    public void SeedAll()
    {
        UserSeeder userSeeder = new UserSeeder(_context, _userService);
        userSeeder.Seed();

        CoinsPackSeeder coinsPackSeeder = new CoinsPackSeeder(_context);
        coinsPackSeeder.Seed();

        GameTableSeeder gameTableSeeder = new GameTableSeeder(_context);
        gameTableSeeder.Seed();

        GameHistorySeeder gameHistorySeeder = new GameHistorySeeder(_context);
        gameHistorySeeder.Seed();
    }
}
