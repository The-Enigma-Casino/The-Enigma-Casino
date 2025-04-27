using Microsoft.AspNetCore.Mvc;
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
    public async Task<ActionResult<Dictionary<string, string>>> GetPlayerAvatars([FromQuery] List<string> nickNames)
    {
        if (nickNames == null || nickNames.Count == 0)
            return BadRequest("Debe enviar al menos un nombre.");

        Dictionary<string, string> result = await _gameService.GetPlayerByNickNames(nickNames);

        return Ok(result);
    }
}
