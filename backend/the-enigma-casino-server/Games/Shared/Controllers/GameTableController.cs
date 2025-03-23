using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using the_enigma_casino_server.Controllers;
using the_enigma_casino_server.Games.Shared.Entities;
using the_enigma_casino_server.Games.Shared.Entities.Enum;
using the_enigma_casino_server.Games.Shared.Services;

namespace the_enigma_casino_server.Games.Shared.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GameTableController : BaseController
    {
        private readonly GametableService _gametableService;

        public GameTableController(GametableService gametableService)
        {
            _gametableService = gametableService;
        }

        [HttpGet("tables")]
        [Authorize]
        public async Task<ActionResult<List<GameTable>>> GetTablesByGameType([FromQuery] GameType gameType)
        {
            try
            {
                List<GameTable> tables = await _gametableService.GetTablesByGameTypeAsync(gameType);
                return Ok(tables);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Ocurrió un error al obtener las mesas. { ex.Message}");
            }
        }
    }
}
