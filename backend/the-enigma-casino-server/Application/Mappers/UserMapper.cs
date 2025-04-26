using the_enigma_casino_server.Application.Dtos;
using the_enigma_casino_server.Application.Dtos.Request;
using the_enigma_casino_server.Core.Entities;

namespace the_enigma_casino_server.Application.Mappers;

public class UserMapper
{
    public UserDto ToUserDto(User user)
    {
        return new UserDto(user.Email, user.FullName, user.NickName, user.Address, user.Country, user.Coins, user.Image, user.IsSelfBanned);
    }

    public OtherUserDto ToUserNotFriendlyDto(User user, string relation)
    {
        return new OtherUserDto( user.NickName, user.Country, user.Image, relation );
    }

    public UserAdminDto ToUserAdminDto(User user)
    {
        return new UserAdminDto(user.Id, user.NickName, user.Image, user.Role);
    }

    public List<UserAdminDto> ToUserAdminList(List<User> users)
    {
        List<UserAdminDto> userAdminList = new List<UserAdminDto>();
        foreach (User user in users)
        {
            userAdminList.Add(ToUserAdminDto(user));
        }
        return userAdminList;
    }
}