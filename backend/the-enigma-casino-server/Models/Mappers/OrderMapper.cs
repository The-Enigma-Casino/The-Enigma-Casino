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

    public OrderHistoryDto ToOrderHistoryDto(Order order)
    {
        OrderHistoryDto orderHistoryDto = new OrderHistoryDto(order.Id, order.PaidDate, order.Price, order.Coins, order.PayMode, order.OrderType);

        if (order.OrderType == OrderType.Purchase)
            orderHistoryDto.Image = order.CoinsPack.Image;

        return orderHistoryDto;
    }

    public List<OrderHistoryDto> ToListOrderHistoryDto(List<Order> orders)
    {
        List<OrderHistoryDto> orderHistoryDtos = new List<OrderHistoryDto>();

        foreach (Order order in orders)
        {
            orderHistoryDtos.Add(ToOrderHistoryDto(order));
        }

        return orderHistoryDtos;
    }

}
