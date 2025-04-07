using the_enigma_casino_server.Models.Database;
using the_enigma_casino_server.Models.Database.Entities;
using the_enigma_casino_server.Models.Database.Entities.Enum;
using the_enigma_casino_server.Models.Dtos;
using the_enigma_casino_server.Models.Mappers;
using the_enigma_casino_server.Services.Blockchain;
using the_enigma_casino_server.Services.Email;

namespace the_enigma_casino_server.Services;

public class OrderService : BaseService
{
    private readonly OrderMapper _orderMapper;
    private readonly UserService _userService;
    private readonly EmailService _emailService;
    private readonly BlockchainService _blockchainService;

    private readonly static int AMOUNT = 5;

    public OrderService(UnitOfWork unitOfWork, OrderMapper orderMapper, UserService userService, EmailService emailService, BlockchainService blockchainService): base(unitOfWork)
    {
        _orderMapper = orderMapper;
        _userService = userService;
        _emailService = emailService;
        _blockchainService = blockchainService;
    }

    public async Task<Order> NewOrder(int userId, int coinsPackId, string sessionId)
    {
        User user = await GetUserById(userId);

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

    public async Task<OrderWithdrawalDto> GetLastOrderWithdrawalByUserIdAsync(int userId)
    {
        Order order = await _unitOfWork.OrderRepository.GetLastOrderAsync(userId);
        return _orderMapper.ToOrderWithdrawalDto(order);
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
        User user = await GetUserById(userId);

        CoinsPack coinsPack = await _unitOfWork.CoinsPackRepository.GetByIdAsync(coinsPackId);
        if (coinsPack == null)
        {
            throw new KeyNotFoundException($"No se encontró un paquete de monedas con el ID {coinsPackId}.");
        }

        decimal ethereum = await _blockchainService.ConvertCoinsToEthereumAsync(coinsPack.Quantity);

        Order order = new Order(user, coinsPack)
        {
            EthereumTransactionHash = txHash,
            PayMode = PayMode.Ethereum,
            Price = coinsPack.Price,
            IsPaid = true,
            PaidDate = DateTime.Now,
            CreatedAt = DateTime.Now,
            EthereumPrice = ethereum,
        };

        await _unitOfWork.OrderRepository.InsertAsync(order);
        await _unitOfWork.SaveAsync();

        return order;
    }

    public async Task EthereumWithdrawalOrder(int userId, int coinsWithdrawal, string txHash, decimal ethereum)
    {
        User user = await GetUserById(userId);

        if (user.Coins < coinsWithdrawal)
        {
            throw new InvalidOperationException("Fichas insuficientes para realizar el retiro.");
        }

        if (ethereum <= 0)
        {
            throw new InvalidOperationException("El valor de Ethereum debe ser mayor que 0.");
        }

        string coinValueStr = Environment.GetEnvironmentVariable("COIN_VALUE_IN_EUROS");

        // Transforma fichas retiradas a euros
        if (string.IsNullOrEmpty(coinValueStr) || !decimal.TryParse(coinValueStr, out decimal coinValueInEuros))
        {
            throw new InvalidOperationException("La variable de entorno 'COIN_VALUE_IN_EUROS' no está configurada correctamente.");
        }

        decimal eurosConvertion = coinsWithdrawal * coinValueInEuros * 100;

        int eurosConvertionInt = (int)eurosConvertion;

        Order order = new Order(user)
        {
            CoinsPackId = 7,
            EthereumTransactionHash = txHash,
            CreatedAt = DateTime.Now,
            PayMode = PayMode.Ethereum,
            OrderType = OrderType.Withdrawal,
            Coins = coinsWithdrawal,
            EthereumPrice = ethereum,
            IsPaid = true,
            PaidDate = DateTime.Now, 
            Price = eurosConvertionInt,
        };

        await _userService.UpdateCoins(userId, (coinsWithdrawal * -1));

        await _unitOfWork.OrderRepository.InsertAsync(order);
        await _unitOfWork.SaveAsync();

        await _emailService.SendWithdrawalAsync(order, user);
    }

    public async Task<OrderHistoryDto> GetOrdersByUser(int userId, int page)
    {
        User user = await GetUserById(userId);

        List<Order> orders = await _unitOfWork.OrderRepository.GetOrdersByUserIdAsync(userId);

        if (orders == null || orders.Count == 0)
            throw new KeyNotFoundException($"El usuario con ID {user.Id} no tiene pedidos.");

        int totalPages = (int)Math.Ceiling(orders.Count / (double)AMOUNT);

        if (page < 1 || page > totalPages)
            throw new ArgumentOutOfRangeException(nameof(page), $"La página {page} está fuera del rango permitido (1 - {totalPages}).");

        List<Order> orderPage = orders
            .Skip((page - 1) * AMOUNT)
            .Take(AMOUNT)
            .ToList();

        List<OrderHistoryItemDto> orderHistoryItemDtos = _orderMapper.ToListOrderHistoryItemDto(orderPage);

        return new OrderHistoryDto(orderHistoryItemDtos, totalPages, page);
    }
}
