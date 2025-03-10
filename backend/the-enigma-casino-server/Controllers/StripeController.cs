using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stripe.Checkout;
using the_enigma_casino_server.Models.Database;
using the_enigma_casino_server.Models.Database.Entities;
using the_enigma_casino_server.Services;

namespace the_enigma_casino_server.Controllers;

[Route("api/[controller]")]
[ApiController]
public class StripeController : BaseController
{
    private readonly StripeService _stripeService;
    private readonly OrderService _orderService;
    private readonly CoinsPackService _coinsPackService;
    private readonly UnitOfWork _unitOfWork;

    public StripeController(StripeService stripeService, CoinsPackService coinsPackService, OrderService orderService, UnitOfWork unitOfWork)
    {
        _stripeService = stripeService;
        _coinsPackService = coinsPackService;
        _orderService = orderService;
        _unitOfWork = unitOfWork;
    }

    public class EmbeddedCheckoutRequest
    {
        public int CoinsPackId { get; set; }
    }

    [HttpPost("embedded-checkout")]
    [Authorize]
    public async Task<IActionResult> EmbeddedCheckout([FromBody] EmbeddedCheckoutRequest request)
    {
        try
        {
            if (request == null || request.CoinsPackId == 0)
            {
                return BadRequest(new { message = "ID de paquete de monedas inválido." });
            }

            int userId = GetUserId();

            SessionCreateOptions options = await _stripeService.EmbededCheckout(userId, request.CoinsPackId);

            SessionService sessionService = new SessionService();
            Session session = await sessionService.CreateAsync(options);

            Order order = await _orderService.NewOrder(userId, request.CoinsPackId, session.Id);

            if (session.ClientSecret == null)
            {
                return StatusCode(500, new { message = "Stripe no devolvió un ClientSecret válido." });
            }

            return Ok(new { clientSecret = session.ClientSecret });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error al generar la sesión de pago.", detail = ex.Message });
        }
    }


    [HttpGet("status/{orderId}")]
    [Authorize]
    public async Task<ActionResult> GetSessionStatus(int orderId)
    {
        int userId = GetUserId();

        Order order = await _unitOfWork.OrderRepository.GetByIdAndUserIdAsync(orderId, userId);

        if (order == null)
        {
            throw new NullReferenceException($"Error al obtener la orden con ID {orderId}.");
        }

        Session session = await _stripeService.SessionStatus(order.StripeSessionId);

        string paymentStatus = await _stripeService.GetPaymentStatus(order.StripeSessionId);

        if ( paymentStatus == "paid")
        {
           await _orderService.UpdatePaid(order); 
        }

        return Ok(new { status = session.Status, customerEmail = session.CustomerEmail, paymentStatus });
    }

}
