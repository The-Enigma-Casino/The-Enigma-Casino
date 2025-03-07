using Microsoft.AspNetCore.Http.HttpResults;
using the_enigma_casino_server.Models.Database;
using the_enigma_casino_server.Models.Database.Entities;
using the_enigma_casino_server.Models.Database.Entities.Enum;
using the_enigma_casino_server.Models.Dtos;
using the_enigma_casino_server.Models.Mappers;

namespace the_enigma_casino_server.Services;

public class OrderService
{
    private readonly UnitOfWork _unitOfWork;
    private readonly OrderMapper _orderMapper;
    private readonly UserService _userService;

    public OrderService(UnitOfWork unitOfWork, OrderMapper orderMapper, UserService userService)
    {
        _unitOfWork = unitOfWork;
        _orderMapper = orderMapper;
        _userService = userService;
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
            StripeSessionId = sessionId,
            PayMode = PayMode.CreditCard,
        };

        await _unitOfWork.OrderRepository.InsertAsync(order);
        await _unitOfWork.SaveAsync();

        return order;
    }

    public async Task<OrderDto> GetLastOrderByUserIdAsync(int userId)
    {
        Order order = await _unitOfWork.OrderRepository.GetLastOrderAsync(userId);
        return _orderMapper.ToOrderDto(order);
    }

    public async Task UpdatePaid(Order order)
    {
        order.IsPaid = true;
        order.PaidDate = DateTime.Now;
        order.StripeSessionId = "";

        await _unitOfWork.SaveAsync();

        await _userService.UpdateCoins(order.UserId, order.CoinsPack.Quantity);

    }

    public async Task<int> GetLastOrderIdByUserIdAsync(int userId)
    {
        Order order = await _unitOfWork.OrderRepository.GetLastOrderAsync(userId);
        return order.Id;
    }
       

}
