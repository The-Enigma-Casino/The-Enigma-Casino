using the_enigma_casino_server.Application.Mappers;
using the_enigma_casino_server.Infrastructure.Database;

namespace the_enigma_casino_server.Application.Services;

public class AdminUserService : BaseService
{
    private readonly UserMapper _userMapper;

    public AdminUserService(UnitOfWork unitOfWork, UserMapper userMapper) : base(unitOfWork)
    {
        _userMapper = userMapper;
    }

    


}
