namespace the_enigma_casino_server.Application.Dtos.BlockchainDtos;

public class CreateTransactionRequest
{
    public string NetworkUrl { get; set; }
    public string To { get; set; }
    public decimal Euros { get; set; }
}
