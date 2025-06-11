namespace the_enigma_casino_server.Application.Dtos.Request;

public class GoogleRegisterRequest
{
    public string IdToken { get; set; }
    public DateTime DateOfBirth { get; set; }
    public string? Country { get; set; }
    public string? Address { get; set; }
}
