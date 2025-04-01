namespace the_enigma_casino_server.Models.Dtos;

public class UserDto
{
    public string Name {  get; set; }
    public string Email { get; set; }
    public string Nickname { get; set; }
    public string Address { get; set; }
    public string Country { get; set; }
    public int Coins { get; set; }
    public string Image { get; set; }

    public UserDto() { }

    public UserDto(string name, string email, string nickname, string address, string country, int coins, string image) 
    {
        Name = name;
        Email = email;
        Nickname = nickname;
        Address = address;
        Country = country;
        Coins = coins;
        Image = image;
    }
}
