using the_enigma_casino_server.Core.Entities;
using the_enigma_casino_server.Infrastructure.Database;

namespace the_enigma_casino_server.Application.Services;

public class GameService : BaseService
{
    public GameService(UnitOfWork unitOfWork) : base(unitOfWork)
    {
    }


    public async Task<Dictionary<string, string>> GetPlayerByNickNames(List<string> nickNames)
    {
        if (nickNames == null || nickNames.Count == 0)
            return new Dictionary<string, string>();

        List<User> players = await _unitOfWork.UserRepository.GetByNickNamesAsync(nickNames);

        return players.ToDictionary(
            p => p.NickName,
            p => p.Image
        );
    }

}
