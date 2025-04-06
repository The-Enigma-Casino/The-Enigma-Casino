using Microsoft.EntityFrameworkCore;
using the_enigma_casino_server.Models.Database.Entities;

namespace the_enigma_casino_server.Models.Database.Repositories;

public class CoinsPackRepository : Repository<CoinsPack, int>
{
    public CoinsPackRepository(MyDbContext context) : base(context)
    {
    }

    public async Task<List<CoinsPack>> GetAllCoinsPackAsync()
    {
        return await GetQueryable()
             .Where(c => c.Id != 7) // Ignora paquete 7
             .ToListAsync();
    }
}
