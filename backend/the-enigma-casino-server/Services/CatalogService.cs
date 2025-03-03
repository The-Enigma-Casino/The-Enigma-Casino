using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using the_enigma_casino_server.Models.Database;
using the_enigma_casino_server.Models.Database.Entities;
using the_enigma_casino_server.Services.Email;

namespace the_enigma_casino_server.Services;

public class CatalogService
{
    private UnitOfWork _unitOfWork;

    public CatalogService(UnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<List<CoinsPack>> GetCoinsPacksAsync()
    {
        return await _unitOfWork.CoinsPackRepository.GetAllCoinsPackAsync();
    }
}
