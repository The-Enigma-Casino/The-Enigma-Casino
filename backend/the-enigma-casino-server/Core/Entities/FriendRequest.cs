using the_enigma_casino_server.Core.Entities.Enum;

namespace the_enigma_casino_server.Core.Entities;

public class FriendRequest
{
    public int Id { get; set; }

    public int SenderId { get; set; }
    public int ReceiverId { get; set; }

    public User Sender { get; set; }

    public DateTime SentAt { get; set; } = DateTime.UtcNow;

    public FriendRequestStatus Status { get; set; } = FriendRequestStatus.Pending;
}