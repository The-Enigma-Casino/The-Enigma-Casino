using the_enigma_casino_server.Games.Shared.Entities.Enum;
using the_enigma_casino_server.Games.Shared.Entities;
using the_enigma_casino_server.Models.Database;

namespace the_enigma_casino_server.Models.Seeder.GameSeeders
{
    public class GameHistorySeeder
    {
        private readonly MyDbContext _context;
        private readonly Random _random;

        public GameHistorySeeder(MyDbContext context)
        {
            _context = context;
            _random = new Random();
        }

        public void Seed()
        {
            if (_context.GameHistory.Any())
            {
                return;
            }

            List<History> gameHistories = new List<History>();

 
            gameHistories.AddRange(GenerateGameHistories(1, 22));
            gameHistories.AddRange(GenerateGameHistories(2, 3));

            _context.GameHistory.AddRange(gameHistories);
            _context.SaveChanges();
        }

        private List<History> GenerateGameHistories(int userId, int numGames)
        {
            List<History> userGameHistories = new List<History>();

            for (int i = 0; i < numGames; i++)
            {
                GameType gameType = GetRandomGameType();
                int totalMatchesPlayed = _random.Next(5, 20);
                int totalBetAmount = _random.Next(1000, 10000);
                int chipResult = _random.Next(-2000, 5000);
                DateTime joinedAt = DateTime.UtcNow.AddDays(-1).AddMinutes(-_random.Next(30, 180));
                DateTime leftAt = joinedAt.AddDays(-1).AddMinutes(_random.Next(5, 60));

                History gameHistory = new History
                {
                    GameTableId = _random.Next(1, 10),
                    UserId = userId,
                    GameType = gameType,
                    TotalMatchesPlayed = totalMatchesPlayed,
                    TotalBetAmount = totalBetAmount,
                    ChipResult = chipResult,
                    JoinedAt = joinedAt,
                    LeftAt = leftAt
                };

                userGameHistories.Add(gameHistory);
            }

            return userGameHistories;
        }

        private GameType GetRandomGameType()
        {
            Array gameTypes = Enum.GetValues(typeof(GameType));
            return (GameType)gameTypes.GetValue(_random.Next(gameTypes.Length));
        }
    }
}
