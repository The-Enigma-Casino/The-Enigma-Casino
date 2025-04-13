using the_enigma_casino_server.Core.Entities.Enum;

namespace the_enigma_casino_server.Application.Dtos;

public class OrderHistoryItemDto
{
    public int Id { get; set; }

    public DateTime PaidDate { get; set; }

    public string Image { get; set; }

    public int Price { get; set; }

    public int Coins { get; set; }

    public PayMode PayMode { get; set; }

    public OrderType OrderType { get; set; }

    public decimal EthereumPrice { get; set; }

    public OrderHistoryItemDto() { }

    public OrderHistoryItemDto(int id, DateTime paidDate, int price, int coins, PayMode payMode, OrderType orderType)
    {
        Id = id;
        PaidDate = paidDate;
        Image = "";
        Price = price;
        EthereumPrice = 0;
        Coins = coins;
        PayMode = payMode;
        OrderType = orderType;
    }

}
