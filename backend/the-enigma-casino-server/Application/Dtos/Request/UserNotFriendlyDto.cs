namespace the_enigma_casino_server.Application.Dtos.Request;

public class UserNotFriendlyDto
{
   public string NickName { get; set; }

    public string Country { get; set; }

    public string Image { get; set; }


    public UserNotFriendlyDto(string nickname, string nountry, string image)
    {
        NickName = nickname;
        Country = nountry;
        Image = image;
    }
}
