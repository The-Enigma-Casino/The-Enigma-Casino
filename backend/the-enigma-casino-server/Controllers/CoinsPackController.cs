

using Microsoft.AspNetCore.Mvc;
using the_enigma_casino_server.Models.Database.Entities;
using the_enigma_casino_server.Services;

namespace the_enigma_casino_server.Controllers;

[Route("api/[controller]")]
[ApiController]
public class CoinsPackController : BaseController
{
    private readonly CoinsPackService _coinsPackService;

    public CoinsPackController(CoinsPackService coinsPackService)
    {
        _coinsPackService = coinsPackService;
    }

    [HttpGet("coins-packs")]
    public async Task<ActionResult<List<CoinsPack>>> GetCoinsPacks()
    {
        try
        {
            List<CoinsPack> coinsPacks = await _coinsPackService.GetCoinsPacksAsync();
            return Ok(coinsPacks);
        }
        catch (Exception ex)
        {
            return StatusCode(500, "Un error ha ocurrido al enviar su petición.");
        }
    }

    [HttpGet("coins-pack-by-id")]
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
}
