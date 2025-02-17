using Microsoft.AspNetCore.Identity.Data;
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


            (bool exists, string message) = await _userService.CheckUser(request.NickName, request.Email, request.Dni);

            if (exists)
                return BadRequest(message);


            User newUser = await _userService.GenerateNewUser(request);
            string token = _userService.GenerateToken(newUser);

            return Ok(token);
        }
        catch (Exception ex)
        {
            return StatusCode(500, "Un error ha ocurrido al enviar su petición.");
        }
    }

    [HttpPost("login")]
    public async Task<ActionResult<string>> Login([FromBody] LoginReq request)
    {
        try
        {
            User user = await _userService.UserLogin(request);

            if (user == null)
            {
                return Unauthorized("Identificador o contraseña inválidos");
            }

            string token = _userService.GenerateToken(user);

            return Ok(token);
        }

        catch (Exception ex)
        {
            return StatusCode(500, "Un error ha ocurrido al enviar su petición.");
        }
    }

}