using the_enigma_casino_server.Core.Entities.Enum;

namespace the_enigma_casino_server.Application.Dtos;

public class UserAdminDto
{
    public int Id { get; set; }
    public string Nickname { get; set; }
    public string Image { get; set; }
    public Role Role { get; set; }
    public bool IsSelfBanned { get; set; }

    public UserAdminDto()
    {
    }

    public UserAdminDto(int id, string nickname, string image, Role role, bool isSelfBanned)
    {
        Id = id;
        Nickname = nickname;
        Image = image;
        Role = role;
        IsSelfBanned = isSelfBanned;
    }

}
