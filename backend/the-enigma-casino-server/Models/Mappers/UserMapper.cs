using the_enigma_casino_server.Models.Database.Entities;
using the_enigma_casino_server.Models.Dtos;

namespace the_enigma_casino_server.Models.Mappers;

public class UserMapper
{
    public UserDto ToUserDto(User user)
    {
        return new UserDto(user.Email, user.FullName, user.NickName, user.Address, user.Country, user.Coins, user.Image);
    }
}
