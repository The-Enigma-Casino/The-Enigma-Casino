using the_enigma_casino_server.Application.Dtos;
using the_enigma_casino_server.Application.Dtos.Request;
using the_enigma_casino_server.Core.Entities;

namespace the_enigma_casino_server.Application.Mappers;

public class UserMapper
{
    public UserDto ToUserDto(User user)
    {
        return new UserDto(user.Email, user.FullName, user.NickName, user.Address, user.Country, user.Coins, user.Image);
    }

    public OtherUserDto ToUserNotFriendlyDto(User user, string relation)
    {
        return new OtherUserDto( user.NickName, user.Country, user.Image, relation );
    }
}