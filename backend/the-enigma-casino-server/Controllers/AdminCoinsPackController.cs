using Microsoft.AspNetCore.Mvc;
using the_enigma_casino_server.Application.Services;
using Microsoft.AspNetCore.Authorization;
using the_enigma_casino_server.Core.Entities;
using the_enigma_casino_server.Application.Dtos.Request;

namespace the_enigma_casino_server.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize(Roles = "Admin")]
public class AdminCoinsPackController : BaseController
{
    private readonly AdminCoinsPackService _adminCoinsPackService;

    private readonly CoinsPackService _coinsPackService;

    public AdminCoinsPackController(AdminCoinsPackService adminCoinsPackService, CoinsPackService coinsPackService)
    {
        _adminCoinsPackService = adminCoinsPackService;
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
            return StatusCode(500, "An error occurred while processing your request.");
        }
    }

    [HttpGet("coins-pack/{id}")]
    public async Task<ActionResult<CoinsPack>> GetCoinsPackById(int id)
    {
        try
        {
            CoinsPack coinsPack = await _coinsPackService.GetByIdAsync(id);

            if (coinsPack == null)
                return NotFound("No se encontró el paquete de monedas.");

            return Ok(coinsPack);
        }
        catch (Exception ex)
        {
            return StatusCode(500, "Un error ha ocurrido al procesar su solicitud.");
        }
    }

    [HttpPut("coins-pack")]
    public async Task<ActionResult> UpdateCoinsPack([FromForm] UpdateCoinsPackRequest request)

    {
        try
        {
            if (request == null || request.Id == 0)
                return BadRequest("Datos inválidos.");

            await _adminCoinsPackService.UpdateCoinsPack(request);
            return Ok("Coins Pack actualizado correctamente.");
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[UpdateCoinsPack] Error: {ex.Message}");
            return StatusCode(500, "Error interno al actualizar el paquete de monedas.");
        }
    }


}
