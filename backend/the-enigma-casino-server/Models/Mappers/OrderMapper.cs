using the_enigma_casino_server.Models.Database.Entities;
using the_enigma_casino_server.Models.Dtos;
using the_enigma_casino_server.Utilities;

namespace the_enigma_casino_server.Models.Mappers
{
    public class OrderMapper
    {
        public OrderDto ToOrderDto(Order order)
        {
            OrderDto orderDto = new OrderDto(order.Id, order.CoinsPack, order.IsPaid, order.PaidDate, order.PayMode );
            orderDto.Coins = Coinsify.CoinsifyByCent(order.Price);

            return orderDto;
        }
    }
}
