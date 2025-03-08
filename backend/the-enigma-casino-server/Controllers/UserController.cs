using Microsoft.AspNetCore.Mvc;
using the_enigma_casino_server.Services;

namespace the_enigma_casino_server.Controllers;

[Route("api/[controller]")]
[ApiController]
public class UserController : BaseController
{
    public UserService _userService;
    public UserController(UserService userService)
    {
        _userService = userService;
    }

    [HttpGet("coins")]
    public async Task<ActionResult<int>> GetCoins()
    {
        try
        {
            int id = GetUserId(); 
            var coins = await _userService.GetCoins(id);

            return Ok(coins); 
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Hubo un error al obtener las monedas: {ex.Message}");
        }
    }

}
