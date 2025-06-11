using Microsoft.AspNetCore.Mvc;
using the_enigma_casino_server.Application.Dtos.Request;
using the_enigma_casino_server.Application.Services;
using the_enigma_casino_server.Core.Entities;

namespace the_enigma_casino_server.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthGoogleController : BaseController
{
    private readonly UserService _userService;

    public AuthGoogleController(UserService userService)
    {
        _userService = userService;
    }

    [HttpPost("register")]
    public async Task<ActionResult<object>> Register([FromBody] GoogleRegisterRequest request)
    {
        try
        {
            User user = await _userService.RegisterWithGoogleAsync(request);
            string token = _userService.GenerateToken(user);

            return Ok(new
            {
                jwt = token,
                nickname = user.NickName,
                image = user.Image
            });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error al registrar con Google." });
        }
    }

    [HttpPost("login")]
    public async Task<ActionResult<object>> Login([FromBody] GoogleAuthRequest request)
    {
        try
        {
            User user = await _userService.LoginWithGoogleAsync(request.IdToken);
            string token = _userService.GenerateToken(user);

            return Ok(new
            {
                jwt = token,
                nickname = user.NickName,
                image = user.Image
            });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error al iniciar sesión con Google." });
        }
    }
}
