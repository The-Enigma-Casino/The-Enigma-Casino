using the_enigma_casino_server.Games.Shared.Entities.Enum;
using the_enigma_casino_server.Games.Shared.Entities;
using the_enigma_casino_server.Models.Database;

namespace the_enigma_casino_server.Models.Seeder.GameSeeders;

public class GameHistorySeeder
{
    private readonly MyDbContext _context;

    public GameHistorySeeder(MyDbContext context)
    {
        _context = context;
    }

    public void Seed()
    {
        if (_context.GameHistory.Any())
        {
            return;
        }

        List<GameHistory> gameHistoryUser1 = new List<GameHistory>
        {
            new GameHistory
            {
                GameTableId = 1, 
                UserId = 1,
                GameType = GameType.Poker,
                TotalMatchesPlayed = 10,
                TotalBetAmount = 5000,
                ChipResult = 2000,
                JoinedAt = DateTime.UtcNow.AddMinutes(-30),
                LeftAt = DateTime.UtcNow.AddMinutes(-15)
            },
            new GameHistory
            {
                GameTableId = 2,
                UserId = 1,
                GameType = GameType.BlackJack,
                TotalMatchesPlayed = 5,
                TotalBetAmount = 3000,
                ChipResult = -500,
                JoinedAt = DateTime.UtcNow.AddMinutes(-60),
                LeftAt = DateTime.UtcNow.AddMinutes(-45)
            }
        };

        List<GameHistory> gameHistoryUser2 = new List<GameHistory>
        {
            new GameHistory
            {
                GameTableId = 3,
                UserId = 2,
                GameType = GameType.Roulette, 
                TotalMatchesPlayed = 15,
                TotalBetAmount = 10000,
                ChipResult = 3000,
                JoinedAt = DateTime.UtcNow.AddMinutes(-120),
                LeftAt = DateTime.UtcNow.AddMinutes(-90)
            },
            new GameHistory
            {
                GameTableId = 4,
                UserId = 2,
                GameType = GameType.Poker,
                TotalMatchesPlayed = 7,
                TotalBetAmount = 7000,
                ChipResult = -1500,
                JoinedAt = DateTime.UtcNow.AddMinutes(-150),
                LeftAt = DateTime.UtcNow.AddMinutes(-130)
            }
        };

        _context.GameHistory.AddRange(gameHistoryUser1);
        _context.GameHistory.AddRange(gameHistoryUser2);

        _context.SaveChanges();
    }
}
