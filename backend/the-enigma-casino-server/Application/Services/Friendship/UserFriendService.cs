using the_enigma_casino_server.Core.Entities;
using the_enigma_casino_server.Infrastructure.Database;
using the_enigma_casino_server.Infrastructure.Database.Repositories;

namespace the_enigma_casino_server.Application.Services.Friendship;

public class UserFriendService
{
    private readonly UnitOfWork _unitOfWork;
    private readonly UserFriendRepository _userFriendRepository;

    public UserFriendService(UnitOfWork unitOfWork, UserFriendRepository userFriendRepository)
    {
        _unitOfWork = unitOfWork;
        _userFriendRepository = userFriendRepository;
    }

    public async Task<List<User>> GetFriendsAsync(int userId)
    {
        return await _userFriendRepository.GetFriendsAsync(userId);
    }

    public async Task RemoveFriendAsync(int userId, int friendId)
    {
        bool alreadyFriends = await _userFriendRepository.AreFriendsAsync(userId, friendId);
        if (!alreadyFriends)
            throw new InvalidOperationException("No sois amigos.");

        await _userFriendRepository.RemoveFriendshipAsync(userId, friendId);
        await _unitOfWork.SaveAsync();
    }

    public async Task<bool> AreFriendsAsync(int userId, int friendId)
    {
        return await _userFriendRepository.AreFriendsAsync(userId,friendId);
    }
}