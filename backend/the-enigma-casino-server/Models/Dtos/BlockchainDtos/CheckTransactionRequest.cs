namespace Examples.WebApi.Models.Dtos;

public class CheckTransactionRequest
{
    public string NetworkUrl { get; set; }
    public string Hash { get; set; }
    public string From { get; set; }
    public string To { get; set; }
    public string Value { get; set; }
}
