using the_enigma_casino_server.Application.Dtos;
using the_enigma_casino_server.Application.Mappers;
using the_enigma_casino_server.Core.Entities;
using the_enigma_casino_server.Infrastructure.Database;

namespace the_enigma_casino_server.Application.Services;

public class GameService : BaseService
{
    UserMapper _userMapper;

    public GameService(UnitOfWork unitOfWork, UserMapper userMapper) : base(unitOfWork)
    {
        _userMapper = userMapper;
    }


    public async Task<List<PlayerDto>> GetPlayerByNickNames(List<string> nickNames)
    {
        if (nickNames == null || nickNames.Count == 0)
            return new List<PlayerDto> { };

        List<User> players = await _unitOfWork.UserRepository.GetByNickNamesAsync(nickNames);

        return _userMapper.ToPlayerDtoList(players);
    }

}
