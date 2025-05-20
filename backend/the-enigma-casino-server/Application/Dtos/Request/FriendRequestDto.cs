namespace the_enigma_casino_server.Application.Dtos.Request
{
    public class FriendRequestDto
    {
        public int Id { get; set; }
        public int SenderId { get; set; }
        public string NickName { get; set; }
        public string Image { get; set; }
    }
}
