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
    private readonly CoinsPackService _coinsPackService;

    public StripeController(StripeService stripeService, CoinsPackService coinsPackService)
    {
        _stripeService = stripeService;
        _coinsPackService = coinsPackService;
    }

    [HttpGet("details")]
    [Authorize]
    public async Task<ActionResult<CoinsPack>> GetReserveDetails([FromQuery] int coinsPackId)
    {
        try
        {
            CoinsPack coinsPack = await _coinsPackService.GetByIdAsync(coinsPackId);
            return Ok(coinsPack);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error inesperado", detail = ex.Message });
        }
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

            return Ok(new { clientSecret = session.ClientSecret });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error al generar la sesión de pago.", detail = ex.Message });
        }
    }

    //[HttpGet("status/{reserveId}")]
    //public async Task<ActionResult> SessionStatus(int coiId)
    //{
    //    Reserve reserve = await _unitOfWork.ReserveRepository.GetReserveById(reserveId);

    //    Session session = await _stripeService.SessionStatus(reserve.SessionId);

    //    string paymentStatus = await _stripeService.GetPaymentStatus(reserve.SessionId);

    //    return Ok(new { status = session.Status, customerEmail = session.CustomerEmail, paymentStatus });
    //}
}
