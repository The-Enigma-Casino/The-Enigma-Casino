namespace the_enigma_casino_server.Models.Dtos.BlockchainDtos;

public class WithdrawalCreateTransactionRequest
{
    public string NetworkUrl { get; set; }
    public string To { get; set; }
    public int coinsWithdrawal { get; set; }
}
