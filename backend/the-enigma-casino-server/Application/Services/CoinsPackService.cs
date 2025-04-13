using the_enigma_casino_server.Core.Entities;
using the_enigma_casino_server.Infrastructure.Database;

namespace the_enigma_casino_server.Application.Services;

public class CoinsPackService
{
    private UnitOfWork _unitOfWork;

    public CoinsPackService(UnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<List<CoinsPack>> GetCoinsPacksAsync()
    {
        return await _unitOfWork.CoinsPackRepository.GetAllCoinsPackAsync();
    }

    public async Task<CoinsPack> GetByIdAsync(int id)
    {
        return await _unitOfWork.CoinsPackRepository.GetByIdAsync(id);
    }
}
