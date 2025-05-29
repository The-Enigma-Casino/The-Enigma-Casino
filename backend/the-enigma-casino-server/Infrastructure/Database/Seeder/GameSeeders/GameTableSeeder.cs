using the_enigma_casino_server.Games.Shared.Enum;
using the_enigma_casino_server.Games.Shared.Entities;
using the_enigma_casino_server.Infrastructure.Database;

namespace the_enigma_casino_server.Infrastructure.Database.Seeder.GameSeeders;

public class GameTableSeeder
{
    private readonly MyDbContext _context;

    public GameTableSeeder(MyDbContext context)
    {
        _context = context;
    }

    public void Seed()
    {
        if (_context.GameTables.Any()) return;

        var tables = new List<Table>();

        // BlackJack
        for (int i = 1; i <= 6; i++)
        {
            tables.Add(new Table
            {
                Name = $"BlackJack Mesa {i}",
                GameType = GameType.BlackJack,
                MaxPlayer = 5,
                MinPlayer = 1,
                TableState = TableState.Waiting
            });
        }

        // Poker
        for (int i = 1; i <= 6; i++)
        {
            tables.Add(new Table
            {
                Name = $"Poker Mesa {i}",
                GameType = GameType.Poker,
                MaxPlayer = 6,
                MinPlayer = 2,
                TableState = TableState.Waiting
            });
        }

        // Roulette
        for (int i = 1; i <= 6; i++)
        {
            tables.Add(new Table
            {
                Name = $"Ruleta Mesa {i}",
                GameType = GameType.Roulette,
                MaxPlayer = 6,
                MinPlayer = 1,
                TableState = TableState.Waiting
            });
        }

        _context.GameTables.AddRange(tables);
        _context.SaveChanges();
    }

}
