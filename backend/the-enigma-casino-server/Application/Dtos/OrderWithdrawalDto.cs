using the_enigma_casino_server.Core.Entities.Enum;

namespace the_enigma_casino_server.Application.Dtos;

public class OrderWithdrawalDto
{
    public int Id { get; set; }

    public DateTime PaidDate { get; set; }

    public int Coins { get; set; }

    public int Price { get; set; }

    public PayMode PayMode { get; set; }

    public string EthereumTransactionHash { get; set; }

    public decimal EthereumPrice { get; set; }
}
