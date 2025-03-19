using the_enigma_casino_server.Games.Shared.Entities;
using the_enigma_casino_server.Models.Database;
using the_enigma_casino_server.Models.Database.Entities;
using the_enigma_casino_server.Models.Database.Repositories;

namespace the_enigma_casino_server.Games.Shared.Repository;

public class CardRepository : Repository<Card, int>
{
    public CardRepository(MyDbContext context) : base(context)
    {
    }
}
