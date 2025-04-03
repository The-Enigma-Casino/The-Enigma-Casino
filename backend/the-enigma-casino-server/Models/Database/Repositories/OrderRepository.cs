using Microsoft.EntityFrameworkCore;
using Stripe.Climate;
using the_enigma_casino_server.Models.Database.Entities;
using Order = the_enigma_casino_server.Models.Database.Entities.Order;

namespace the_enigma_casino_server.Models.Database.Repositories;

public class OrderRepository : Repository<Order, int>
{
    public OrderRepository(MyDbContext context) : base(context)
    {
    }

    public async Task<Order> GetLastOrderAsync(int userId)
    {
        return await GetQueryable()
            .Where(o => o.UserId == userId)
            .Include(o => o.CoinsPack)
            .OrderByDescending(o => o.CreatedAt)
            .FirstOrDefaultAsync();
    }

    public async Task<Order> GetByIdAndUserIdAsync(int orderId, int userId)
    {
        return await GetQueryable()
            .Where(o => o.UserId == userId && o.Id == orderId)
            .Include(o => o.CoinsPack)
            .FirstOrDefaultAsync();
    }

    public async Task<List<Order>> GetOrdersByUserIdAsync(int userId)
    {
        return await GetQueryable()
            .Where(o => o.UserId == userId)
            .Include(o => o.CoinsPack)
            .ToListAsync();
    }

}
