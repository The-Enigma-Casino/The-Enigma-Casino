using Microsoft.AspNetCore.Http.HttpResults;
using the_enigma_casino_server.Models.Database;
using the_enigma_casino_server.Models.Database.Entities;
using the_enigma_casino_server.Models.Database.Entities.Enum;
using the_enigma_casino_server.Models.Database.Repositories;
using the_enigma_casino_server.Models.Dtos;
using the_enigma_casino_server.Models.Mappers;
using the_enigma_casino_server.Services.Email;

namespace the_enigma_casino_server.Services;

public class OrderService
{
    private readonly UnitOfWork _unitOfWork;
    private readonly OrderMapper _orderMapper;
    private readonly UserService _userService;
    private readonly EmailService _emailService;

    public OrderService(UnitOfWork unitOfWork, OrderMapper orderMapper, UserService userService, EmailService emailService)
    {
        _unitOfWork = unitOfWork;
        _orderMapper = orderMapper;
        _userService = userService;
        _emailService = emailService;
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

        _unitOfWork.OrderRepository.Update(order);
        await _unitOfWork.SaveAsync();

        await _userService.UpdateCoins(order.UserId, order.CoinsPack.Quantity);

        User user = await _unitOfWork.UserRepository.GetByIdAsync(order.UserId);

        if (user != null)
        {
           await _emailService.SendInvoiceAsync(order, user);
        }

    }

    public async Task<int> GetLastOrderIdByUserIdAsync(int userId)
    {
        Order order = await _unitOfWork.OrderRepository.GetLastOrderAsync(userId);
        return order.Id;
    }

    //Usado en Ethereum
    public async Task<decimal> GetCoinsPackPrice(int coinsPackId)
    {
        CoinsPack coinsPack = await _unitOfWork.CoinsPackRepository.GetByIdAsync(coinsPackId);

        if (coinsPack == null)
        {
            throw new KeyNotFoundException($"No hay pack de monedas con este ID {coinsPackId}");
        }

        return coinsPack.Price / 100m; // Se convierte el precio a decimal para ETH
    }

    //Ethereum
    public async Task<Order> NewEthereumOrder(int userId, int coinsPackId, string txHash)
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
            EthereumTransactionHash = txHash,  
            PayMode = PayMode.Ethereum,  
            Price = coinsPack.Price,
            IsPaid = true,
            PaidDate = DateTime.Now,
            CreatedAt = DateTime.Now,
        };

        await _unitOfWork.OrderRepository.InsertAsync(order);
        await _unitOfWork.SaveAsync();

        return order;
    }

    //public async Task<Order> EthereumWithdrawalOrder(int userId, int coinsWithdrawal, string txHash)
    //{
    //    User user = await _unitOfWork.UserRepository.GetUserById(userId);

    //    if(user == null)
    //    {
    //        throw new KeyNotFoundException($"No se encontró un usuario con el ID {userId}.");
    //    }

    //    if (user.Coins < coinsWithdrawal)
    //    {
    //        throw new InvalidOperationException("Fichas insuficiente para realizar el retiro.");
    //    }

    //    Order order = new Order
    //    {
    //        UserId = user.Id,  
    //        CoinsPackId = -1,
    //        EthereumTransactionHash = txHash, 
    //        CreatedAt = DateTime.Now,  
    //        OrderType = OrderType.Withdrawal,
    //        Coins = coinsWithdrawal,
    //        EthereumPrice = ??,
    //        IsPaid = true
    //    };

    //    await _unitOfWork.OrderRepository.InsertAsync(order);
    //    await _unitOfWork.SaveAsync();

    //    return order;
    //}

    public async Task<OrderHistoryDto> GetOrdersByUser(int userId)
    {
        User user = await _unitOfWork.UserRepository.GetUserById(userId);
        if (user == null)
            throw new KeyNotFoundException($"No se encontró un usuario con el ID {userId}.");

        return null;
    }
}
