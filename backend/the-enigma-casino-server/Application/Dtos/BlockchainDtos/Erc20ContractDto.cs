using System.Numerics;

namespace the_enigma_casino_server.Application.Dtos.BlockchainDtos;

public class Erc20ContractDto
{
    public string Name { get; set; }
    public string Symbol { get; set; }
    public int Decimals { get; set; }
    public string TotalSupply { get; set; }
}
