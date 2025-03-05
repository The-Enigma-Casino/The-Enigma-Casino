
using the_enigma_casino_server.Models.Database.Entities.Enum;

namespace the_enigma_casino_server.Models.Database.Entities;

public class Order
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public User User { get; set; }

    public int CoinsPackId { get; set; }

    public CoinsPack CoinsPack { get; set; }

    public string StripeSessionId { get; set; }

    public bool IsPaid { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime PaidDate { get; set; }

    public int Price { get; set; }

    public PayMode PayMode { get; set; }

    public Order()
    {

    }

    public Order( User user, CoinsPack coinsPack )
    {
        IsPaid = false;
        CreatedAt = DateTime.Now;

        User = user;
        UserId = user.Id;

        CoinsPack = coinsPack;
        CoinsPackId = coinsPack.Id;

        Price = coinsPack.Price;
    }

}
