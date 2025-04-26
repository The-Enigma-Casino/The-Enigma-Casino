using the_enigma_casino_server.Core.Entities.Enum;
using the_enigma_casino_server.Games.Shared.Entities;

namespace the_enigma_casino_server.Core.Entities;

public class User
{
    public int Id { get; set; }
    public string NickName { get; set; }
    public string FullName { get; set; }
    public string Email { get; set; }
    public string HashPassword { get; set; }
    public string Image { get; set; }
    public DateTime DateOfBirth { get; set; }
    public string Country { get; set; }
    public string Address { get; set; }
    public int Coins { get; set; }
    public bool IsSelfBanned { get; set; }
    public bool EmailConfirm { get; set; }
    public string ConfirmationToken { get; set; }
    public Role Role { get; set; }
    public List<Order> Orders { get; set; }
    public List<History> Histories { get; set; }


    // FALTAN COSAS

    public User()
    {
        Coins = 0;
        IsSelfBanned = false;
        EmailConfirm = false;
        ConfirmationToken = null;
        Role = Role.User;
        Image = "user_default.png";
    }
}