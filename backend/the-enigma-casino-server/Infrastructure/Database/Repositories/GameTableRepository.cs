using Microsoft.EntityFrameworkCore;
using the_enigma_casino_server.Games.Shared.Entities;
using the_enigma_casino_server.Games.Shared.Enum;
using the_enigma_casino_server.Infrastructure.Database;

namespace the_enigma_casino_server.Infrastructure.Database.Repositories;

public class GameTableRepository : Repository<Table, int>
{
    public GameTableRepository(MyDbContext context) : base(context)
    {
    }

    public async Task<List<Table>> GetByGameTypeAsync(GameType gameType)
    {
        return await GetQueryable()
            .Where(g => g.GameType == gameType)
            .ToListAsync();
    }

    public async Task<List<Table>> GetTablesByGameTypeAsync(GameType gameType)
    {
        return await GetQueryable()
            .Where(t => t.GameType == gameType)
            .ToListAsync();
    }
}