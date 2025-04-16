namespace the_enigma_casino_server.Core.Entities;

public class UserFriend
{
    public int Id { get; set; }

    public int UserId { get; set; }
    public int FriendId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}