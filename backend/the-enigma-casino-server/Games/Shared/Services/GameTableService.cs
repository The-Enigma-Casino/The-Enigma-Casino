using the_enigma_casino_server.Games.Shared.Entities;
using the_enigma_casino_server.Games.Shared.Entities.Enum;
using the_enigma_casino_server.Models.Database;

namespace the_enigma_casino_server.Games.Shared.Services;

public class TableService
{
    private readonly UnitOfWork _unitOfWork;

    public TableService(UnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<List<Table>> GetTablesByGameTypeAsync(GameType gameType)
    {
        return await _unitOfWork.GameTableRepository.GetByGameTypeAsync(gameType);
    }

    public async Task<Table> GetTableByIdAsync(int id)
    {
        return await _unitOfWork.GameTableRepository.GetByIdAsync(id);
    }
}
