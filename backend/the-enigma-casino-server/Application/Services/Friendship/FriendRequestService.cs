using the_enigma_casino_server.Core.Entities;
using the_enigma_casino_server.Infrastructure.Database;
using the_enigma_casino_server.Core.Entities.Enum;
using the_enigma_casino_server.Application.Dtos.Request;

namespace the_enigma_casino_server.Application.Services.Friendship;

public class FriendRequestService
{
    private readonly UnitOfWork _unitOfWork;

    public FriendRequestService(UnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<List<FriendRequestDto>> GetReceivedRequestsDtoAsync(int userId)
    {
        return await _unitOfWork.FriendRequestRepository.GetReceivedRequestsDtoAsync(userId);
    }

    public async Task<bool> CanSendRequestAsync(int senderId, int receiverId)
    {
        if (senderId == receiverId)
            return false;

        FriendRequest pendingRequest = await _unitOfWork.FriendRequestRepository.GetPendingRequestAsync(senderId, receiverId);
        if (pendingRequest != null)
            return false;

        bool alreadyFriends = await _unitOfWork.UserFriendRepository.AreFriendsAsync(senderId, receiverId);
        if (alreadyFriends)
            return false;

        return true;
    }

    public async Task AcceptFriendRequestAsync(int senderId, int receiverId)
    {
        FriendRequest? request = await _unitOfWork.FriendRequestRepository.GetPendingRequestAsync(senderId, receiverId);
        if (request == null)
            throw new InvalidOperationException("La solicitud no existe o ya ha sido procesada.");

        request.Status = FriendRequestStatus.Accepted;
        _unitOfWork.FriendRequestRepository.Update(request);

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

        await _unitOfWork.UserFriendRepository.InsertAsync(friendship1);
        await _unitOfWork.UserFriendRepository.InsertAsync(friendship2);

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

        await _unitOfWork.FriendRequestRepository.InsertAsync(newRequest);
        await _unitOfWork.SaveAsync();
    }

    public async Task CancelFriendRequestAsync(int senderId, int receiverId)
    {
        FriendRequest existingRequest = await _unitOfWork.FriendRequestRepository.GetPendingRequestAsync(senderId, receiverId);
        if (existingRequest != null)
        {
            _unitOfWork.FriendRequestRepository.Delete(existingRequest);
            await _unitOfWork.SaveAsync();
        }
    }
}