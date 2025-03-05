using Microsoft.EntityFrameworkCore;
using the_enigma_casino_server.Models.Database.Entities;

namespace the_enigma_casino_server.Models.Database.Repositories;

public class OrderRepository : Repository<Order, int>
{
    public OrderRepository(MyDbContext context) : base(context)
    {
    }

    public async Task<Order> GetLastOrderAsync(int userId)
    {
        return await GetQueryable()
            .Include(c => c.CoinsPack)
            .Where(o => o.UserId == userId)
            .OrderByDescending(o => o.CreatedAt)
            .FirstOrDefaultAsync();
    }

    public async Task<Order> GetByIdAndUserIdAsync(int orderId, int userId)
    {
        return await GetQueryable()
            .Where(o => o.UserId == userId && o.Id == orderId)
            .FirstOrDefaultAsync();
    }

}
