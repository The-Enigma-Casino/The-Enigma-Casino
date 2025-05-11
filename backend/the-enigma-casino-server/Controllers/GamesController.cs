using Microsoft.AspNetCore.Mvc;
using the_enigma_casino_server.Application.Dtos;
using the_enigma_casino_server.Application.Services;

namespace the_enigma_casino_server.Controllers;

[Route("api/[controller]")]
[ApiController]
public class GamesController : BaseController
{
    private readonly GameService _gameService;

    public GamesController(GameService gameService)
    {
        _gameService = gameService;
    }

    [HttpGet("player-avatars")]
    public async Task<ActionResult<List<PlayerDto>>> GetPlayerAvatars([FromQuery] List<string> nickNames)
    {

        try
        {
            GetUserId();

            if (nickNames == null || nickNames.Count == 0)
                return BadRequest("Debe enviar al menos un nombre.");

            List<PlayerDto> result = await _gameService.GetPlayerByNickNames(nickNames);

            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, "Un error ha ocurrido al enviar su petición.");
        }

    }

    [HttpGet("last-big-win")]
    public async Task<ActionResult<List<BigWinDto>>> LastBigWin()
    {
        try
        {
            List<BigWinDto> result = await _gameService.LastBigWin();

            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, "Un error ha ocurrido al enviar su petición.");
        }
    }
}
