using the_enigma_casino_server.Games.Entities;
using the_enigma_casino_server.Models.Database;
using the_enigma_casino_server.Models.Database.Repositories;

namespace the_enigma_casino_server.Games.Repository;

public class GameSessionRepository : Repository<GameSession, int>
{
    public GameSessionRepository(MyDbContext context) : base(context)
    {
    }
}
