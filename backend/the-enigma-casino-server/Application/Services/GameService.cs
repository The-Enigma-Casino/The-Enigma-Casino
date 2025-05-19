using the_enigma_casino_server.Application.Dtos;
using the_enigma_casino_server.Application.Mappers;
using the_enigma_casino_server.Core.Entities;
using the_enigma_casino_server.Games.Shared.Entities;
using the_enigma_casino_server.Infrastructure.Database;

namespace the_enigma_casino_server.Application.Services;

public class GameService : BaseService
{
    UserMapper _userMapper;

    GameHistoryMapper _historyMapper;

    public GameService(UnitOfWork unitOfWork, UserMapper userMapper, GameHistoryMapper gameHistoryMapper) : base(unitOfWork)
    {
        _userMapper = userMapper;
        _historyMapper = gameHistoryMapper;
    }


    public async Task<List<PlayerDto>> GetPlayerByNickNames(List<string> nickNames)
    {
        if (nickNames == null || nickNames.Count == 0)
            return new List<PlayerDto> { };

        List<User> players = await _unitOfWork.UserRepository.GetByNickNamesAsync(nickNames);

        return _userMapper.ToPlayerDtoList(players);
    }


    public async Task<List<BigWinDto>> LastBigWin()
    {
        const int LIMIT = 20;
        const int MIN_WIN = 200;

        List<History> bigWins = await _unitOfWork.GameHistoryRepository.GetTopBigWinsAsync(LIMIT, MIN_WIN);
        List<BigWinDto> bigWinDtos = _historyMapper.ToListBigWinDto(bigWins);

        return bigWinDtos;
    }
}
