namespace the_enigma_casino_server.Application.Dtos.Request;

public class OtherUserDto
{
    public string NickName { get; set; }
    public string Country { get; set; }
    public string Image { get; set; }
    public string Relation { get; set; }


    public OtherUserDto(string nickname, string nountry, string image, string relation)
    {
        NickName = nickname;
        Country = nountry;
        Image = image;
        Relation = relation;
    }
}
