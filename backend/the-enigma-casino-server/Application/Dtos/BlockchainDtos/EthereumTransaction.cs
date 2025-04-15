namespace the_enigma_casino_server.Application.Dtos.BlockchainDtos;

public class EthereumTransaction
{
    public string Value { get; set; }
    public string Gas { get; set; }
    public string GasPrice { get; set; }

    public string To { get; set; }

    public decimal TotalEuros { get; set; }
    public string EquivalentEthereum { get; set; }
}
