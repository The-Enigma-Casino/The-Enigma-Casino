using the_enigma_casino_server.Core.Entities;
using the_enigma_casino_server.Infrastructure.Database;

namespace the_enigma_casino_server.Application.Services;

public class BaseService
{
    protected UnitOfWork _unitOfWork;

    public BaseService(UnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    protected async Task<User> GetUserById(int id)
    {
        User user = await _unitOfWork.UserRepository.GetByIdAsync(id);

        if (user == null)
            throw new KeyNotFoundException($"No se encontró un usuario con el ID {user}.");

        return user;
    }
}
