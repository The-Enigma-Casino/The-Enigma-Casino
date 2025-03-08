using System.Numerics;

namespace Examples.WebApi.Models.Dtos;

public class Erc20ContractDto
{
    public string Name { get; set; }
    public string Symbol { get; set; }
    public int Decimals { get; set; }
    public string TotalSupply { get; set; }
}
