using Examples.WebApi.Models.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using the_enigma_casino_server.Models.Dtos.BlockchainDtos;
using the_enigma_casino_server.Services;
using the_enigma_casino_server.Services.Blockchain;


namespace the_enigma_casino_server.Controllers;

[Route("api/[controller]")]
[ApiController]
public class BlockchainController : BaseController
{
    private readonly BlockchainService _blockchainService;
    private readonly OrderService _orderService;

    public BlockchainController(BlockchainService blockchainService, OrderService orderService)
    {
        _blockchainService = blockchainService;
        _orderService = orderService;
    }

    [HttpPost("transaction")] //Devuelve TOTAL EUROS de los pack y TOTAL ETHEREUM convertido
    [Authorize]
    public async Task<EthereumTransaction> CreateTransaction([FromBody] OrderTransactionRequest request) 
    {

        decimal totalEuros = (await _orderService.GetCoinsPackPrice(request.CoinsPackId)) / 100m; //100m aquí porque el metodo se usa en otros endpoint  ORDER ID hacer este metodo para order

        string ethNetworkUrl = Environment.GetEnvironmentVariable("NETWORKURL");
        if (string.IsNullOrEmpty(ethNetworkUrl))
        {
            throw new InvalidOperationException("La variable de entorno 'NETWORKURL' no está configurada.");
        }

        var transactionRequest = new CreateTransactionRequest
        {
            NetworkUrl = ethNetworkUrl,
            Euros = totalEuros
        };

        var ethereumTransaction = await _blockchainService.GetEthereumInfoAsync(transactionRequest);

        decimal ethPriceInEuros = await _blockchainService.GetEthereumPriceInEurosAsync(); 
        decimal equivalentEth = totalEuros / ethPriceInEuros;

        ethereumTransaction.TotalEuros = totalEuros;
        ethereumTransaction.EquivalentEthereum = equivalentEth.ToString("0.000000");

        return ethereumTransaction;
    }

    [HttpPost("check")] // Si devuelve TRUE la transaccion se completa, unirlo al front para la billetera de Metamask
    [Authorize]
    public async Task<bool> CheckTransactionAsync([FromBody] CheckTransactionRequest data)
    {
        return await _blockchainService.CheckTransactionAsync(data);
    }
}
