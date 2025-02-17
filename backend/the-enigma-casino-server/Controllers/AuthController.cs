using Microsoft.AspNetCore.Mvc;
using the_enigma_casino_server.Models.Database;
using the_enigma_casino_server.Models.Database.Entities;
using the_enigma_casino_server.Models.Dtos.Request;
using the_enigma_casino_server.Services;
using the_enigma_casino_server.Utilities;

namespace the_enigma_casino_server.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController : BaseController
{
    public UserService _userService;
    public AuthController(UserService userService)
    {

        _userService = userService;
    }

    [HttpPost("register")]
    public async Task<ActionResult<string>> Register([FromBody] RegisterReq request)
    {
        try
        {
            if (string.IsNullOrEmpty(request.NickName) || string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Dni)) 
                return BadRequest("Alguno de los campos enviados está vacío.");


            // Ver si existe el usuario
            (bool exists, string message) = await _userService.ExistsUser(request.NickName, request.Email, request.Dni);

            if (exists)
                return BadRequest(message);

            // Crear usuario
            User newUser = await _userService.GenerateNewUser(request);
            string token = _userService.GenerateToken(newUser);

            return Ok(token);
        }
        catch (Exception ex)
        {
            Console.Write(ex.ToString());
            return StatusCode(500, "Un error ha ocurrido al enviar su petición.");
        }
    }

}