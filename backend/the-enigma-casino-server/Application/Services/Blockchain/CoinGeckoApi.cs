using System.Text.Json;

namespace the_enigma_casino_server.Application.Services.Blockchain;

public class CoinGeckoApi // SIN USO (solo acepta 5 peticiones/min)
{
    private const string URL = "https://api.coingecko.com/api/v3/";

    public async Task<decimal> GetEthereumPriceAsync()
    {
        using HttpClient client = new HttpClient()
        {
            BaseAddress = new Uri(URL)
        };

        string json = await client.GetStringAsync("coins/ethereum");
        JsonElement jsonElement = JsonSerializer.Deserialize<JsonElement>(json);
        JsonElement jsonMarketData = jsonElement.GetProperty("market_data");
        JsonElement jsonPrices = jsonMarketData.GetProperty("current_price");
        decimal euros = jsonPrices.GetProperty("eur").GetDecimal();

        return euros;
    }
}
