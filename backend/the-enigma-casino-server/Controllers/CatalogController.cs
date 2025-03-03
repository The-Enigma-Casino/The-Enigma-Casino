

using Microsoft.AspNetCore.Mvc;
using the_enigma_casino_server.Models.Database.Entities;
using the_enigma_casino_server.Services;

namespace the_enigma_casino_server.Controllers;

[Route("api/[controller]")]
[ApiController]
public class CatalogController : BaseController
{
    public CoinsPackService _catalogService;

    public CatalogController(CoinsPackService catalogService)
    {
        _catalogService = catalogService;
    }

    [HttpGet("coins-packs")]
    public async Task<ActionResult<List<CoinsPack>>> GetCoinsPacks()
    {
        try
        {
            List<CoinsPack> coinsPacks = await _catalogService.GetCoinsPacksAsync();
            return Ok(coinsPacks);
        }
        catch (Exception ex)
        {
            return StatusCode(500, "Un error ha ocurrido al enviar su petición.");
        }
    }
}
