using the_enigma_casino_server.Models.Database.Entities.Enum;
using the_enigma_casino_server.Models.Database.Entities;

namespace the_enigma_casino_server.Models.Dtos;

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
