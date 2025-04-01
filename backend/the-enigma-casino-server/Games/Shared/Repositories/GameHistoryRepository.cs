using Microsoft.EntityFrameworkCore;
using the_enigma_casino_server.Games.Shared.Entities;
using the_enigma_casino_server.Models.Database;
using the_enigma_casino_server.Models.Database.Repositories;

namespace the_enigma_casino_server.Games.Shared.Repositories
{
    public class GameHistoryRepository : Repository<GameHistory, int>
    {
        public GameHistoryRepository(MyDbContext context) : base(context)
        {
        }

        public async Task<List<GameHistory>> GetByUserIdAsync(int userId)
        {
            return await Context.Set<GameHistory>()
                .Where(h => h.UserId == userId)
                .ToListAsync();
        }
    }
}
