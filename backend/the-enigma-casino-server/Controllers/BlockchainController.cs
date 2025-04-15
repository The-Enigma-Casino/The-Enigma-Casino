using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using System.Web;
using the_enigma_casino_server.Core.Entities;
using the_enigma_casino_server.Application.Dtos;
using the_enigma_casino_server.Application.Mappers;
using the_enigma_casino_server.Application.Dtos.BlockchainDtos;
using the_enigma_casino_server.Application.Services;
using the_enigma_casino_server.Application.Services.Blockchain;


namespace the_enigma_casino_server.Controllers;

[Route("api/[controller]")]
[ApiController]
public class BlockchainController : BaseController
{
    private readonly BlockchainService _blockchainService;
    private readonly OrderService _orderService;
    private readonly OrderMapper _orderMapper;
    private readonly UserService _userService;

    public BlockchainController(BlockchainService blockchainService, OrderService orderService, OrderMapper orderMapper, UserService userService)
    {
        _blockchainService = blockchainService;
        _orderService = orderService;
        _orderMapper = orderMapper;
        _userService = userService;
    }

    [HttpPost("transaction")]
    [Authorize]
    public async Task<IActionResult> CreateTransaction([FromBody] OrderTransactionRequest request)
    {
        try
        {
            if (request == null || request.CoinsPackId < 1 || request.CoinsPackId > 6) // 6 Packs
            {
                return BadRequest("El ID del paquete de fichas es inválido.");
            }

            decimal totalEuros = await _orderService.GetCoinsPackPrice(request.CoinsPackId);
            if (totalEuros <= 0)
            {
                return BadRequest("El precio del paquete de fichas no es válido.");
            }

            string ethNetworkUrl = Environment.GetEnvironmentVariable("NETWORKURL");
            if (string.IsNullOrEmpty(ethNetworkUrl))
            {
                return StatusCode(500, "Error en la configuración del servidor.");
            }

            var transactionRequest = new CreateTransactionRequest
            {
                NetworkUrl = ethNetworkUrl,
                Euros = totalEuros
            };

            var ethereumTransaction = await _blockchainService.GetEthereumInfoAsync(transactionRequest);

            decimal ethPriceInEuros = await _blockchainService.GetEthereumPriceInEurosAsync();
            if (ethPriceInEuros <= 0)
            {
                return StatusCode(500, "Error al obtener el precio de Ethereum.");
            }

            // Calcular la equivalencia en ETH
            decimal equivalentEth = totalEuros / ethPriceInEuros;
            ethereumTransaction.TotalEuros = totalEuros;
            ethereumTransaction.EquivalentEthereum = Math.Round(equivalentEth, 6).ToString("0.######");

            return Ok(ethereumTransaction);
        }
        catch (Exception ex)
        {
            return StatusCode(500, "Ocurrió un error procesando la transacción.");
        }
    }

    [HttpPost("check")]
    [Authorize]
    public async Task<IActionResult> CheckTransactionAsync([FromBody] CheckTransactionRequest data)
    {
        try
        {
            bool isTransactionValid = await _blockchainService.CheckTransactionAsync(data);

            if (!isTransactionValid)
            {
                return BadRequest("La transacción no es válida.");
            }

            int userId = GetUserId();

            Order order = await _orderService.NewEthereumOrder(userId, data.CoinsPackId, data.Hash);

            if (order.IsPaid)
            {
                await _orderService.UpdatePaid(order);
            }

            OrderDto orderDto = _orderMapper.ToOrderDto(order);

            return Ok(orderDto);
        }
        catch (Exception ex)
        {
            return StatusCode(500, "Ocurrió un error procesando la transacción.");
        }
    }


    [HttpPost("withdrawal")]
    [Authorize]
    public async Task<IActionResult> CreateTransactionAsync([FromBody] WithdrawalCreateTransactionRequest data)
    {
        try
        {
            data.NetworkUrl = HttpUtility.UrlDecode(data.NetworkUrl);
            int userId = GetUserId();

            int userCoins = await _userService.GetCoins(userId);

            if (data.CoinsWithdrawal > userCoins)
            {
                return BadRequest(new { message = "No dispone de suficientes fichas." });
            }

            var (transactionDto, ethereums) = await _blockchainService.CreateTransactionAsync(data, userId);

            await _orderService.EthereumWithdrawalOrder(userId, data.CoinsWithdrawal, transactionDto.Hash, ethereums);

            return Ok(transactionDto);
        }
        catch (Exception ex)
        {
            return StatusCode(500, "Ocurrió un error procesando la transacción.");
        }
    }

    [HttpPost("convertWithdrawal")]  
    [Authorize]
    public async Task<IActionResult> ConvertWithdrawal([FromBody] ConvertWithdrawalRequest request)
    {
        try
        {
            if (request == null || request.Withdrawalcoins <= 0) 
            {
                return BadRequest("El número de fichas no puede ser menor o igual a cero.");
            }
            int userId = GetUserId();
            int userCoins = await _userService.GetCoins(userId);

            if (request.Withdrawalcoins > userCoins)
            {
                return BadRequest(new { message = "No dispone de suficientes fichas." });
            }

            ConvertWithdrawalDto convertWithdrawalDto = await _blockchainService.ConvertWithdrawal(request.Withdrawalcoins);

            return Ok(convertWithdrawalDto);
        }
        catch (Exception ex)
        {
            return StatusCode(500, "Ocurrió un error procesando la conversión.");
        }
    }
}
