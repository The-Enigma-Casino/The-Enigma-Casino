using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stripe.Checkout;
using the_enigma_casino_server.Models.Database;
using the_enigma_casino_server.Models.Database.Entities;
using the_enigma_casino_server.Models.Dtos;
using the_enigma_casino_server.Services;

namespace the_enigma_casino_server.Controllers;

[Route("api/[controller]")]
[ApiController]
public class StripeController : BaseController
{
    private readonly StripeService _stripeService;
    private readonly Services.OrderService _orderService;
    private readonly CoinsPackService _coinsPackService;
    private readonly UnitOfWork _unitOfWork;

    public StripeController(StripeService stripeService, CoinsPackService coinsPackService, Services.OrderService orderService, UnitOfWork unitOfWork)
    {
        _stripeService = stripeService;
        _coinsPackService = coinsPackService;
        _orderService = orderService;
        _unitOfWork = unitOfWork;
    }

    [HttpPost("embedded-checkout")]
    [Authorize]
    public async Task<IActionResult> EmbeddedCheckout([FromBody] int coinsPackId)
    {
        try
        {
            int userId = GetUserId();

            SessionCreateOptions options = await _stripeService.EmbededCheckout(userId, coinsPackId);

            SessionService sessionService = new SessionService();
            Session session = await sessionService.CreateAsync(options);

            Models.Database.Entities.Order order = await _orderService.NewOrder(userId, coinsPackId, session.Id);

            return Ok(new { clientSecret = session.ClientSecret });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error al generar la sesión de pago.", detail = ex.Message });
        }
    }

    [HttpGet("status/{orderId}")]
    public async Task<ActionResult> GetSessionStatus(int orderId)
    {
        Models.Database.Entities.Order order = await _unitOfWork.OrderRepository.GetByIdAsync(orderId);

        if (order == null)
        {
            throw new NullReferenceException($"Error al obtener la orden con ID {orderId}.");
        }

        Session session = await _stripeService.SessionStatus(order.StripeSessionId);

        string paymentStatus = await _stripeService.GetPaymentStatus(order.StripeSessionId);

        return Ok(new { status = session.Status, customerEmail = session.CustomerEmail, paymentStatus });
    }

}
