using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using the_enigma_casino_server.Models.Database;
using the_enigma_casino_server.Models.Database.Config;
using the_enigma_casino_server.Models.Database.Entities;
using the_enigma_casino_server.Services.Email;

namespace the_enigma_casino_server.Services;

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
