using the_enigma_casino_server.Infrastructure.Database;
using the_enigma_casino_server.Infrastructure.Database.Repositories;

namespace the_enigma_casino_server.Application.Services;

public class UserFriendService
{
    private readonly UnitOfWork _unitOfWork;

    public UserFriendService(UnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> AreFriendsAsync(int userId, int otherUserId)
    {
        return await _unitOfWork.UserFriendRepository.AreFriendsAsync(userId, otherUserId);
    }
}