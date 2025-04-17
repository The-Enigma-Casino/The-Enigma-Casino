using the_enigma_casino_server.Core.Entities;
using the_enigma_casino_server.Infrastructure.Database.Repositories;
using the_enigma_casino_server.Infrastructure.Database;
using the_enigma_casino_server.Core.Entities.Enum;

namespace the_enigma_casino_server.Application.Services.Friendship;

public class FriendRequestService
{
    private readonly FriendRequestRepository _friendRequestRepository;
    private readonly UserFriendRepository _userFriendRepository;
    private readonly UnitOfWork _unitOfWork;

    public FriendRequestService(
        FriendRequestRepository friendRequestRepository,
        UserFriendRepository userFriendRepository,
        UnitOfWork unitOfWork)
    {
        _friendRequestRepository = friendRequestRepository;
        _userFriendRepository = userFriendRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<List<FriendRequest>> GetReceivedRequestsAsync(int userId)
    {
        return await _friendRequestRepository.GetReceivedRequestsAsync(userId);
    }

    public async Task<bool> CanSendRequestAsync(int senderId, int receiverId)
    {
        if (senderId == receiverId)
            return false;

        FriendRequest pendingRequest = await _friendRequestRepository.GetPendingRequestAsync(senderId, receiverId);
        if (pendingRequest != null)
            return false;

        bool alreadyFriends = await _userFriendRepository.AreFriendsAsync(senderId, receiverId);
        if (alreadyFriends)
            return false;

        return true;
    }

    public async Task AcceptFriendRequestAsync(int senderId, int receiverId)
    {
        FriendRequest? request = await _friendRequestRepository.GetPendingRequestAsync(senderId, receiverId);
        if (request == null)
            throw new InvalidOperationException("La solicitud no existe o ya ha sido procesada.");

        request.Status = FriendRequestStatus.Accepted;
        _friendRequestRepository.Update(request);

        UserFriend friendship1 = new UserFriend
        {
            UserId = senderId,
            FriendId = receiverId
        };

        UserFriend friendship2 = new UserFriend
        {
            UserId = receiverId,
            FriendId = senderId
        };

        await _userFriendRepository.InsertAsync(friendship1);
        await _userFriendRepository.InsertAsync(friendship2);

        await _unitOfWork.SaveAsync();
    }


    public async Task SendFriendRequestAsync(int senderId, int receiverId)
    {
        bool canSend = await CanSendRequestAsync(senderId, receiverId);
        if (!canSend)
            throw new InvalidOperationException("No se puede enviar la solicitud.");

        FriendRequest newRequest = new FriendRequest
        {
            SenderId = senderId,
            ReceiverId = receiverId
        };

        await _friendRequestRepository.InsertAsync(newRequest);
        await _unitOfWork.SaveAsync();
    }

    public async Task CancelFriendRequestAsync(int senderId, int receiverId)
    {
        FriendRequest existingRequest = await _friendRequestRepository.GetPendingRequestAsync(senderId, receiverId);
        if (existingRequest != null)
        {
            _friendRequestRepository.Delete(existingRequest);
            await _unitOfWork.SaveAsync();
        }
    }
}