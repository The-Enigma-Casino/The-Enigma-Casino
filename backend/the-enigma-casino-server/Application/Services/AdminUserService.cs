using the_enigma_casino_server.Application.Dtos;
using the_enigma_casino_server.Application.Mappers;
using the_enigma_casino_server.Application.Services.Email;
using the_enigma_casino_server.Core.Entities;
using the_enigma_casino_server.Core.Entities.Enum;
using the_enigma_casino_server.Infrastructure.Database;

namespace the_enigma_casino_server.Application.Services;

public class AdminUserService : BaseService
{
    private readonly UserMapper _userMapper;

    private readonly UserService _userService;

    private readonly EmailService _emailService;

    public AdminUserService(UnitOfWork unitOfWork, UserMapper userMapper, UserService userService, EmailService emailService) : base(unitOfWork)
    {
        _userMapper = userMapper;
        _userService = userService;
        _emailService = emailService;
    }

    public async Task<List<UserAdminDto>> GetUsersAsync()
    {
        List<User> users = await _unitOfWork.UserRepository.GetAllUserAsync();
        return _userMapper.ToUserAdminList(users);
    }


    public async Task<Role> UpdateRolById(int id)
    {
        User user = await _unitOfWork.UserRepository.GetByIdAsync(id);

        if (user == null)
            throw new Exception("Usuario no existente.");

        if (user.Role == Role.User)
            user = await _userService.SetRoleByUser(user, Role.Admin);
        else if (user.Role == Role.Admin)
            user = await _userService.SetRoleByUser(user, Role.User);

        return user.Role;
    }

    public async Task<Role> BanUserById(int id)
    {
        User user = await _unitOfWork.UserRepository.GetByIdAsync(id);

        if (user == null)
            throw new Exception("Usuario no existente.");

        if (user.Role == Role.User)
        {
            user = await _userService.SetRoleByUser(user, Role.Banned);
            await _emailService.SendBannedEmailAsync(user);
        }
        else if (user.Role == Role.Banned)
        {
            user = await _userService.SetRoleByUser(user, Role.User);
            await _emailService.SendUnbannedEmailAsync(user);
        }


        return user.Role;
    }

    public async Task<List<UserAdminDto>> SearchUsersByNickName(string nickName)
    {
        List<User> users = await _userService.SearchUsersByNickName(nickName);

        return _userMapper.ToUserAdminList(users);
    }


}
