using Microsoft.EntityFrameworkCore;
using the_enigma_casino_server.Application.Dtos;
using the_enigma_casino_server.Core.Entities;

namespace the_enigma_casino_server.Infrastructure.Database.Repositories;

public class UserFriendRepository : Repository<UserFriend, int>
{
    public UserFriendRepository(MyDbContext context) : base(context) { }

    public async Task<bool> AreFriendsAsync(int userId, int friendId)
    {
        return await Context.Set<UserFriend>().AnyAsync(friend =>
            (friend.UserId == userId && friend.FriendId == friendId) ||
            (friend.UserId == friendId && friend.FriendId == userId));
    }

    public async Task<List<FriendDto>> GetFriendsAsync(int userId)
    {
        List<int> friendIds = await Context.Set<UserFriend>()
            .Where(friend => friend.UserId == userId)
            .Select(friend => friend.FriendId)
            .ToListAsync();

        if (!friendIds.Any())
            return new List<FriendDto>();

        return await Context.Set<User>()
            .Where(user => friendIds.Contains(user.Id))
            .Select(user => new FriendDto
            {
                Id = user.Id,
                NickName = user.NickName,
                Image = user.Image
            })
            .ToListAsync();
    }

    public async Task<List<int>> GetFriendIdsAsync(int userId)
    {
        return await Context.Set<UserFriend>()
            .Where(friend => friend.UserId == userId)
            .Select(friend => friend.FriendId)
            .ToListAsync();
    }
    public async Task RemoveFriendshipAsync(int userId, int friendId)
    {
        List<UserFriend> friendships = await Context.Set<UserFriend>()
            .Where(f =>
                (f.UserId == userId && f.FriendId == friendId) ||
                (f.UserId == friendId && f.FriendId == userId))
            .ToListAsync();

        if (!friendships.Any())
            return;

        Context.Set<UserFriend>().RemoveRange(friendships);
        await Context.SaveChangesAsync();
    }

    public async Task<List<User>> GetOnlineFriendsAsync(int userId, List<int> onlineUserIds)
    {
        return await Context.Set<UserFriend>()
            .Where(uf => uf.UserId == userId && onlineUserIds.Contains(uf.FriendId))
            .Join(Context.Users,
                  uf => uf.FriendId,
                  u => u.Id,
                  (uf, u) => u)
            .ToListAsync();
    }
}