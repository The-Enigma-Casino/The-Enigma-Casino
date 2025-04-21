using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using the_enigma_casino_server.Application.Dtos;
using the_enigma_casino_server.Application.Dtos.Request;
using the_enigma_casino_server.Application.Services;

namespace the_enigma_casino_server.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
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
            int coins = await _userService.GetCoins(id);

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


    [HttpGet("profile")]
    public async Task<ActionResult<UserDto>> GetProfile()
    {
        try
        {
            int id = GetUserId();
            UserDto userDto = await _userService.GetProfile(id);

            return userDto;
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error interno: {ex.Message}");
        }
    }


    [HttpGet("profile/{id}")]
    public async Task<ActionResult<OtherUserDto>> GetOtherProfile(int id) // Traer otro Dto
    {
        try
        {
            OtherUserDto otherUserDto = await _userService.GetNotFriendlyProfile(id);
            return Ok(otherUserDto);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error interno: {ex.Message}");
        }
    }

    [HttpPut("profile/image")]
    public async Task<ActionResult> UpdateProfileImage([FromForm] UpdateProfileImageDto dto)
    {
        try
        {
            int userId = GetUserId();
            await _userService.UpdateUserImageAsync(userId, dto.Image);

            return Ok("Imagen actualizada correctamente");
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error al actualizar la imagen: {ex.Message}");
        }
    }
}