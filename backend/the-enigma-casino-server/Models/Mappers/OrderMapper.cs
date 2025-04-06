using Microsoft.AspNetCore.Razor.TagHelpers;
using Stripe;
using the_enigma_casino_server.Models.Database.Entities;
using the_enigma_casino_server.Models.Database.Entities.Enum;
using the_enigma_casino_server.Models.Dtos;
using the_enigma_casino_server.Utilities;
using static System.Net.Mime.MediaTypeNames;

namespace the_enigma_casino_server.Models.Mappers;

public class OrderMapper
{
    public OrderDto ToOrderDto(Order order)
    {
        OrderDto orderDto = new OrderDto(order.Id, order.CoinsPack, order.IsPaid, order.PaidDate, order.PayMode );
        orderDto.Coins = Coinsify.CoinsifyByCent(order.Price);

        return orderDto;
    }

    public OrderDto ToOrderDtoWithCoinsPackDto(Order order)
    {
        
        CoinsPackDto coinsPackDto = new CoinsPackDto
        {
            Id = order.CoinsPack.Id,       
            Price = order.CoinsPack.Price
        };

        
        OrderDto orderDto = new OrderDto(
            order.Id,                         
            coinsPackDto,                     
            order.IsPaid,                     
            order.PaidDate,                   
            order.PayMode                     
        );

        
        orderDto.Coins = Coinsify.CoinsifyByCent(order.Price);
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
