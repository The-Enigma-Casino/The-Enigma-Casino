using Microsoft.EntityFrameworkCore;
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

    public async Task<List<User>> GetFriendsAsync(int userId)
    {
        List<int> friendIds = await Context.Set<UserFriend>()
            .Where(friend => friend.UserId == userId)
            .Select(friend => friend.FriendId)
            .ToListAsync();

        return await Context.Set<User>()
            .Where(user => friendIds.Contains(user.Id))
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

        Context.Set<UserFriend>().RemoveRange(friendships);
    }
}