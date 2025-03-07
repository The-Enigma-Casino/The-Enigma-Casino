
using Microsoft.AspNetCore.Mvc;
using the_enigma_casino_server.Models.Database.Entities;
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

    [HttpGet("last-order-id")]
    public async Task<int> GetLastOrderIdByUserIdAsync()
    {
        int userId = GetUserId();

        return await _orderService.GetLastOrderIdByUserIdAsync(userId);
    }

}
