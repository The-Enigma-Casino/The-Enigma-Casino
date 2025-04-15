using the_enigma_casino_server.Core.Entities;
using the_enigma_casino_server.Core.Entities.Enum;

namespace the_enigma_casino_server.Application.Dtos;

public class OrderDto
{

    public int Id { get; set; }

    public CoinsPack CoinsPack { get; set; }

    public bool IsPaid { get; set; }

    public DateTime PaidDate { get; set; }

    public int Coins { get; set; }

    public PayMode PayMode { get; set; }

    public decimal? Ehtereum { get; set; }

    public OrderDto(int id, CoinsPack coinsPack, bool isPaid, DateTime paidDate, PayMode payMode)
    {

        Id = id;
        CoinsPack = coinsPack;
        IsPaid = isPaid;
        PaidDate = paidDate;
        PayMode = payMode;
    }
}
