using Microsoft.EntityFrameworkCore;
using the_enigma_casino_server.Core.Entities;
using the_enigma_casino_server.Core.Entities.Enum;

namespace the_enigma_casino_server.Infrastructure.Database.Repositories;

public class FriendRequestRepository : Repository<FriendRequest, int>
{
    public FriendRequestRepository(MyDbContext context) : base(context)
    {
    }
    public async Task<FriendRequest?> GetPendingRequestAsync(int senderId, int receiverId)
    {
        return await Context.Set<FriendRequest>()
            .FirstOrDefaultAsync(r =>
                r.SenderId == senderId &&
                r.ReceiverId == receiverId &&
                r.Status == FriendRequestStatus.Pending);
    }

    public async Task<List<FriendRequest>> GetReceivedRequestsAsync(int userId)
    {
        return await Context.Set<FriendRequest>()
            .Where(r => r.ReceiverId == userId && r.Status == FriendRequestStatus.Pending)
            .ToListAsync();
    }

    public async Task<List<FriendRequest>> GetSentRequestsAsync(int userId)
    {
        return await Context.Set<FriendRequest>()
            .Where(r => r.SenderId == userId && r.Status == FriendRequestStatus.Pending)
            .ToListAsync();
    }
}