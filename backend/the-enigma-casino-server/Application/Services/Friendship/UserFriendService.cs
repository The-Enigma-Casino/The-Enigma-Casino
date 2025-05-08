using the_enigma_casino_server.Core.Entities;
using the_enigma_casino_server.Infrastructure.Database;
using the_enigma_casino_server.Infrastructure.Database.Repositories;

namespace the_enigma_casino_server.Application.Services.Friendship;

public class UserFriendService
{
    private readonly UnitOfWork _unitOfWork;

    public UserFriendService(UnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<List<User>> GetFriendsAsync(int userId)
    {
        return await _unitOfWork.UserFriendRepository.GetFriendsAsync(userId);
    }

    public async Task RemoveFriendAsync(int userId, int friendId)
    {
        bool alreadyFriends = await _unitOfWork.UserFriendRepository.AreFriendsAsync(userId, friendId);
        if (!alreadyFriends)
            throw new InvalidOperationException("No sois amigos.");

        await _unitOfWork.UserFriendRepository.RemoveFriendshipAsync(userId, friendId);
        await _unitOfWork.SaveAsync();
    }

    public async Task<bool> AreFriendsAsync(int userId, int friendId)
    {
        return await _unitOfWork.UserFriendRepository.AreFriendsAsync(userId,friendId);
    }

    public async Task<List<User>> GetOnlineFriendsAsync(int userId, List<int> friendIds)
    {
        return await _unitOfWork.UserFriendRepository.GetOnlineFriendsAsync(userId, friendIds);
    }
    public async Task<List<int>> GetFriendIdsAsync(int userId)
    {
        return await _unitOfWork.UserFriendRepository.GetFriendIdsAsync(userId);
    }

}