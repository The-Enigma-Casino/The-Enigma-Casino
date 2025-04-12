
namespace BlackJackGame.Entities;
public class User
{
    public int Id { get; set; }
    public string NickName { get; set; }
    public string FullName { get; set; }
    public string Email { get; set; }
    public string HashPassword { get; set; }
    public string Image { get; set; }
    public string HashDNI { get; set; }
    public string Country { get; set; }
    public string Address { get; set; }
    public int Coins { get; set; }
    public bool IsBanned { get; set; }
    public bool EmailConfirm { get; set; }
    public string ConfirmationToken { get; set; }
    //public Role Role { get; set; }
    //public List<Order> Orders { get; set; }

    public User()
    {
        Coins = 0;
        IsBanned = false;
        EmailConfirm = false;
        //ConfirmationToken = null;
        //Role = Role.User;
        Image = "AAAAA";
    }
}
