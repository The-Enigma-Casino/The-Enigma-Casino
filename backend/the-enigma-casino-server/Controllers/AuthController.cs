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

            await _userService.SendEmailConfirmation(newUser);

            return Ok("Registro exitoso. Revisa tu email para confirmar tu cuenta.");
        }
        catch (Exception ex)
        {
            return StatusCode(500, "Un error ha ocurrido al enviar su petición.");
        }
    }

    [HttpGet("confirm-email")]
    public async Task<ActionResult<string>> ConfirmEmail([FromQuery] string token)
    {
        try
        {
            if (string.IsNullOrEmpty(token))
                return BadRequest("El token de confirmación es obligatorio.");

            bool result = await _userService.ConfirmUserEmailAsync(token);

            if (!result)
                return NotFound("Token de confirmación no válido o expirado.");

            return Ok("Tu cuenta ha sido confirmada exitosamente.");

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

            string token = _userService.GenerateToken(user);

            return Ok(new { token });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Un error ha ocurrido al procesar tu solicitud." });
        }
    }

}