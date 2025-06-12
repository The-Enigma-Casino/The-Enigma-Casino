using System.Text.Json;

namespace the_enigma_casino_server.Application.Services.Blockchain;

public class CryptoCompareApi // EN USO Peticiones ilimitadas
{
    private const string URL = "https://min-api.cryptocompare.com/";

    private readonly HttpClient _client;

    public CryptoCompareApi()
    {
        _client = new HttpClient()
        {
            BaseAddress = new Uri(URL)
        };
    }

    public async Task<decimal> GetEthereumPriceAsync()
    {
        string json = await _client.GetStringAsync("data/price?fsym=ETH&tsyms=EUR");
        using JsonDocument jsonDocument = JsonDocument.Parse(json);
        JsonElement jsonElement = jsonDocument.RootElement;
        decimal euros = jsonElement.GetProperty("EUR").GetDecimal();

        return euros;
    }
}
