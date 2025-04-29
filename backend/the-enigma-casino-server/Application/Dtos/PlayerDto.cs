namespace the_enigma_casino_server.Application.Dtos;

public class PlayerDto
{
    public int Id { get; set; }
    public string NickName { get; set; }
    public string Image { get; set; }
    public string Country { get; set; }

    public PlayerDto() { }

    public PlayerDto(int id, string nickName, string image, string country)
    {
        Id = id;
        NickName = nickName;
        Image = image;
        Country = country;
    }
}
