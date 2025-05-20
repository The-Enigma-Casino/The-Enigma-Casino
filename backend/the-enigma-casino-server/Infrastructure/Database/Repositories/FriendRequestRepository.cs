using Microsoft.EntityFrameworkCore;
using the_enigma_casino_server.Application.Dtos.Request;
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

    public async Task<List<FriendRequestDto>> GetReceivedRequestsDtoAsync(int userId)
    {
        return await Context.Set<FriendRequest>()
            .Include(r => r.Sender)
            .Where(r => r.ReceiverId == userId && r.Status == FriendRequestStatus.Pending)
            .Select(r => new FriendRequestDto
            {
                Id = r.Id,
                SenderId = r.SenderId,
                NickName = r.Sender.NickName,
                Image = r.Sender.Image
            })
            .ToListAsync();
    }

    public async Task<List<FriendRequest>> GetSentRequestsAsync(int userId)
    {
        return await Context.Set<FriendRequest>()
            .Where(r => r.SenderId == userId && r.Status == FriendRequestStatus.Pending)
            .ToListAsync();
    }

    public async Task AddAsync(FriendRequest request)
    {
        await Context.Set<FriendRequest>().AddAsync(request);
    }

    public async Task<bool> ExistsBetweenUsersAsync(int userId1, int userId2)
    {
        return await Context.Set<FriendRequest>().AnyAsync(r =>
            (r.SenderId == userId1 && r.ReceiverId == userId2) ||
            (r.SenderId == userId2 && r.ReceiverId == userId1));
    }

    public async Task<List<int>> GetPendingRequestUserIdsAsync(int currentUserId)
    {
        return await Context.Set<FriendRequest>()
            .Where(r =>
                (r.SenderId == currentUserId || r.ReceiverId == currentUserId) &&
                r.Status == FriendRequestStatus.Pending)
            .Select(r => r.SenderId == currentUserId ? r.ReceiverId : r.SenderId)
            .Distinct()
            .ToListAsync();
    }
}