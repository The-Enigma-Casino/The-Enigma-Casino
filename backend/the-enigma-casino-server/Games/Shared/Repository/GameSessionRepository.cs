using Microsoft.EntityFrameworkCore;
using the_enigma_casino_server.Games.Shared.Entities;
using the_enigma_casino_server.Games.Shared.Entities.Enum;
using the_enigma_casino_server.Models.Database;
using the_enigma_casino_server.Models.Database.Repositories;

namespace the_enigma_casino_server.Games.Shared.Repository;

public class GameSessionRepository : Repository<GameSession, int>
{
    public GameSessionRepository(MyDbContext context) : base(context)
    {
    }

    public async Task<GameSession> GetSessionByPlayerIdAsync(int userId)
    {
        return await GetQueryable()
            .Where(s => s.Players.Any(p => p.UserId == userId) && s.IsWaiting)
            .FirstOrDefaultAsync();
    }

    public async Task<GameSession> GetSessionByGameTypeAsync(GameType gameType)
    {
        return await GetQueryable()
            .Where(s => s.GameType == gameType && s.IsWaiting)
            .FirstOrDefaultAsync();
    }

}
