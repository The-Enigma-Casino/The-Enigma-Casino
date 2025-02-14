using Microsoft.AspNetCore.Mvc;
using the_enigma_casino_server.Models.Database;
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
            return Ok("Usuario registrado exitosamente.");
        }
        catch (Exception ex)
        {

        }
    }

}
