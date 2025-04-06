using Microsoft.EntityFrameworkCore;
using the_enigma_casino_server.Games.Shared.Entities;
using the_enigma_casino_server.Models.Database;
using the_enigma_casino_server.Models.Database.Repositories;

namespace the_enigma_casino_server.Games.Shared.Repositories;

public class GameHistoryRepository : Repository<History, int>
{
    public GameHistoryRepository(MyDbContext context) : base(context)
    {
    }

    public async Task<List<History>> GetByUserIdAsync(int userId)
    {
        return await Context.Set<History>()
            .Where(h => h.UserId == userId)
            .OrderByDescending(h => h.JoinedAt)
            .ToListAsync();
    }

    public async Task<History?> FindActiveSessionAsync(int userId, int tableId)
    {
        return await Context.Set<History>()
            .FirstOrDefaultAsync(h =>
                h.UserId == userId &&
                h.GameTableId == tableId &&
                h.LeftAt == default);
    }
}
