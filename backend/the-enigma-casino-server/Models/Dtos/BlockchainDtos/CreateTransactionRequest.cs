namespace Examples.WebApi.Models.Dtos;

public class CreateTransactionRequest
{
    public string NetworkUrl { get; set; }
    public string To { get; set; }
    public int coinsWithdrawal { get; set; }
}
