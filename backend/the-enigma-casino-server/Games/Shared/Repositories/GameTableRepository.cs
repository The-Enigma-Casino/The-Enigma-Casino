using Microsoft.EntityFrameworkCore;
using the_enigma_casino_server.Games.Shared.Entities;
using the_enigma_casino_server.Games.Shared.Entities.Enum;
using the_enigma_casino_server.Models.Database;
using the_enigma_casino_server.Models.Database.Repositories;

namespace the_enigma_casino_server.Games.Shared.Repositories;

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
}