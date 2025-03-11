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
    }
}
