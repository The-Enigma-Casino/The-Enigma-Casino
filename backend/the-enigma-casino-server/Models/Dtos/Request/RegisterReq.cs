namespace the_enigma_casino_server.Models.Dtos.Request;

public class RegisterReq
{
    public string NickName { get; set; }
    public string FullName { get; set; }
    public string Email { get; set; }
    public string Password { get; set; }
    public string Dni { get; set; }
    public string Country { get; set; }
    public string Address { get; set; }
}
