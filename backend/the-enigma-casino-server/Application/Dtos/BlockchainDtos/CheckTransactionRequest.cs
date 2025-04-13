namespace the_enigma_casino_server.Application.Dtos.BlockchainDtos;

public class CheckTransactionRequest
{
    public string NetworkUrl { get; set; }
    public string Hash { get; set; }
    public string From { get; set; }
    public string To { get; set; }
    public string Value { get; set; }
    public int CoinsPackId { get; set; }
}
