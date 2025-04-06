using Microsoft.AspNetCore.Mvc;
using the_enigma_casino_server.Models.Dtos;
using the_enigma_casino_server.Services;

namespace the_enigma_casino_server.Controllers;

[Route("api/[controller]")]
[ApiController]
public class OrderController : BaseController
{
    private readonly OrderService _orderService;

    public OrderController(OrderService orderService)
    {
        _orderService = orderService;
    }

    [HttpGet("last-order")]
    public async Task<OrderDto> GetLastOrderByUserId()
    {
        int userId = GetUserId();

        return await _orderService.GetLastOrderByUserIdAsync(userId);
    }

    [HttpGet("last-order-withdrawal")]
    public async Task<OrderWithdrawalDto> GetLastOrderWithdrawalByUserId()
    {
        int userId = GetUserId();
        return await _orderService.GetLastOrderWithdrawalByUserIdAsync(userId);
    }


    [HttpGet("last-order-id")]
    public async Task<int> GetLastOrderIdByUserIdAsync()
    {
        int userId = GetUserId();

        return await _orderService.GetLastOrderIdByUserIdAsync(userId);
    }

    [HttpGet("orders")]
    public async Task<ActionResult<OrderHistoryDto>> GetOrdersByUser(int page)
    {
        try
        {
            int userId = GetUserId();

            return Ok(await _orderService.GetOrdersByUser(userId, page));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
        catch (ArgumentOutOfRangeException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error interno del servidor: {ex.Message}");
        }
    }
}
