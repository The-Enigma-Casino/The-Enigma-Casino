using the_enigma_casino_server.Core.Entities.Enum;

namespace the_enigma_casino_server.Application.Dtos;

public class UserAdminDto
{
    private int Id { get; set; }
    private string Nickname { get; set; }
    private string Image { get; set; }
    private Role Role { get; set; }

    public UserAdminDto()
    {
    }

    public UserAdminDto(int id, string nickname, string image, Role role)
    {
        Id = id;
        Nickname = nickname;
        Image = image;
        Role = role;
    }

}
