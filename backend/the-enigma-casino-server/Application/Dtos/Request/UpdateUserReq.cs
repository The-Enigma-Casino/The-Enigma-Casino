namespace the_enigma_casino_server.Application.Dtos.Request;

public class UpdateUserReq
{
    public string NickName { get; set; }
    public string FullName { get; set; }
    public string Email { get; set; }
    public string Country { get; set; }
    public string Address { get; set; }
}
