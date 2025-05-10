using the_enigma_casino_server.Application.Dtos;
using the_enigma_casino_server.Application.Dtos.Request;
using the_enigma_casino_server.Core.Entities;
using the_enigma_casino_server.Infrastructure.Database;
using the_enigma_casino_server.Infrastructure.Database.Repositories;

namespace the_enigma_casino_server.Application.Services.Friendship;

public class UserFriendService : BaseService
{

    public UserFriendService(UnitOfWork unitOfWork) : base(unitOfWork)
    {

    }

    public async Task<List<FriendDto>> GetFriendsAsync(int userId)
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

    public async Task<OtherUserDto> GetOtherProfile(int currentUserId, int profileUserId)
    {
        User user = await GetUserById(profileUserId);

        if (user == null)
            throw new KeyNotFoundException("Usuario no encontrado");

        string relation;

        if (currentUserId == profileUserId)
        {
            relation = "self";
        }
        else
        {
            bool isFriend = await AreFriendsAsync(currentUserId, profileUserId);
            relation = isFriend ? "friend" : "stranger";
        }

        return new OtherUserDto(user.NickName, user.Country, user.Image, relation);

    }
}