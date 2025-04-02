using the_enigma_casino_server.Models.Database.Entities.Enum;

namespace the_enigma_casino_server.Models.Dtos;

public class OrderHistoryDto
{
    public int Id { get; set; }

    public DateTime PaidDate { get; set; }

    public string Image { get; set; }

    public int Price { get; set; }

    public int Coins { get; set; }

    public PayMode PayMode { get; set; }

    public OrderType OrderType { get; set; }

    public OrderHistoryDto() { }

    public OrderHistoryDto(int id, DateTime paidDate, int price, int coins, PayMode payMode, OrderType orderType)
    {
        Id = id;
        PaidDate = paidDate;
        Image = "";
        Price = price;
        Coins = coins;
        PayMode = payMode;
        OrderType = orderType;
    }

}
