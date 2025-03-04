using the_enigma_casino_server.Models.Database;
using the_enigma_casino_server.Models.Database.Entities;

namespace the_enigma_casino_server.Services;

public class OrderService
{
    private readonly UnitOfWork _unitOfWork;

    public OrderService(UnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Order> NewOrder(int userId, int coinsPackId, string sessionId)
    {
        User user = await _unitOfWork.UserRepository.GetUserById(userId);
        if (user == null)
        {
            throw new KeyNotFoundException($"No se encontró un usuario con el ID {userId}.");
        }

        CoinsPack coinsPack = await _unitOfWork.CoinsPackRepository.GetByIdAsync(coinsPackId);
        if (coinsPack == null)
        {
            throw new KeyNotFoundException($"No se encontró un paquete de monedas con el ID {coinsPackId}.");
        }

        Order order = new Order(user, coinsPack)
        {
            StripeSessionId = sessionId
        };

        await _unitOfWork.OrderRepository.InsertAsync(order);
        await _unitOfWork.SaveAsync();

        return order;
    }

    public async Task<Order> GetLastOrderByUserIdAsync(int userId)
    {
        return await _unitOfWork.OrderRepository.GetLastOrderAsync(userId);
    }


}
