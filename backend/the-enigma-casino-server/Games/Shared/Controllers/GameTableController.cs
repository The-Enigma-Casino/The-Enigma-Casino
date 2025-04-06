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
        private readonly TableService _gametableService;

        public GameTableController(TableService gametableService)
        {
            _gametableService = gametableService;
        }

        [HttpGet("tables")]
        [Authorize]
        public async Task<ActionResult<List<Table>>> GetTablesByGameType([FromQuery] GameType gameType)
        {
            try
            {
                List<Table> tables = await _gametableService.GetTablesByGameTypeAsync(gameType);
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
