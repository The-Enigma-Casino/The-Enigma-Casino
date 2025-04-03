using Examples.WebApi.Models.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using the_enigma_casino_server.Models.Database.Entities;
using the_enigma_casino_server.Models.Database;
using the_enigma_casino_server.Models.Dtos.BlockchainDtos;
using the_enigma_casino_server.Services;
using the_enigma_casino_server.Services.Blockchain;
using the_enigma_casino_server.Models.Dtos;
using the_enigma_casino_server.Models.Mappers;
using Nethereum.RPC.Eth.DTOs;
using System.Web;


namespace the_enigma_casino_server.Controllers;

[Route("api/[controller]")]
[ApiController]
public class BlockchainController : BaseController
{
    private readonly BlockchainService _blockchainService;
    private readonly OrderService _orderService;
    private readonly OrderMapper _orderMapper;

    public BlockchainController(BlockchainService blockchainService, OrderService orderService, OrderMapper orderMapper)
    {
        _blockchainService = blockchainService;
        _orderService = orderService;
        _orderMapper = orderMapper;
    }

    [HttpPost("transaction")]  //Cambiar nombre
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

    [HttpPost("check")] //Cambiar nombre
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
    public async Task<TransactionDto> CreateTransactionAsync([FromBody] WithdrawalCreateTransactionRequest data)
    {
        try
        {
            data.NetworkUrl = HttpUtility.UrlDecode(data.NetworkUrl);
            int userId = GetUserId();

            var (transactionDto, ethereums) = await _blockchainService.CreateTransactionAsync(data, userId);

            await _orderService.EthereumWithdrawalOrder(userId, data.CoinsWithdrawal, transactionDto.Hash, ethereums);

            return transactionDto;
        }
        catch (Exception ex)
        {
            return null;
        }
    }

}
