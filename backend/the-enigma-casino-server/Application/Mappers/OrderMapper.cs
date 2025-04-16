using the_enigma_casino_server.Application.Dtos;
using the_enigma_casino_server.Core.Entities;
using the_enigma_casino_server.Core.Entities.Enum;
using the_enigma_casino_server.Utilities;


namespace the_enigma_casino_server.Application.Mappers;

public class OrderMapper
{
    public OrderDto ToOrderDto(Order order)
    {
        OrderDto orderDto = new OrderDto(order.Id, order.CoinsPack, order.IsPaid, order.PaidDate, order.PayMode);
        orderDto.Coins = Coinsify.CoinsifyByCent(order.Price);

        if (order.PayMode == PayMode.Ethereum)
        {
            orderDto.Ehtereum = order.EthereumPrice;
        }

        return orderDto;
    }

    public OrderHistoryItemDto ToOrderHistoryItemDto(Order order)
    {
        OrderHistoryItemDto orderHistoryDto = new OrderHistoryItemDto(order.Id, order.PaidDate, order.Price, order.Coins, order.PayMode, order.OrderType);

        if (order.OrderType == OrderType.Purchase)
            orderHistoryDto.Image = order.CoinsPack.Image;

        if (order.PayMode == PayMode.Ethereum)
            orderHistoryDto.EthereumPrice = order.EthereumPrice;

        return orderHistoryDto;
    }

    public List<OrderHistoryItemDto> ToListOrderHistoryItemDto(List<Order> orders)
    {
        List<OrderHistoryItemDto> orderHistoryDtos = new List<OrderHistoryItemDto>();

        foreach (Order order in orders)
        {
            orderHistoryDtos.Add(ToOrderHistoryItemDto(order));
        }

        return orderHistoryDtos;
    }

    public OrderWithdrawalDto ToOrderWithdrawalDto(Order order)
    {
        return new OrderWithdrawalDto
        {
            Id = order.Id,
            PaidDate = order.PaidDate,
            Coins = order.Coins,
            Price = order.Price,
            PayMode = order.PayMode,
            EthereumTransactionHash = order.EthereumTransactionHash,
            EthereumPrice = order.EthereumPrice
        };
    }

}
