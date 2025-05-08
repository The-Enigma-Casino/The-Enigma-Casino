using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Nethereum.Contracts.QueryHandlers.MultiCall;
using the_enigma_casino_server.Application.Dtos;
using the_enigma_casino_server.Application.Dtos.Request;
using the_enigma_casino_server.Application.Services;
using the_enigma_casino_server.Utilities;

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


    //[HttpGet("profile/{encodedId}")] // NO BORRAR
    //public async Task<ActionResult<OtherUserDto>> GetOtherProfile(string encodedId)
    //{
    //    try
    //    {
    //        int currentUserId = GetUserId();
    //        int profileUserId = SqidHelper.Decode(encodedId);

    //        OtherUserDto otherUserDto = await _userService.GetOtherProfile(currentUserId, profileUserId);
    //        return Ok(otherUserDto);
    //    }
    //    catch (KeyNotFoundException ex)
    //    {
    //        return NotFound(ex.Message);
    //    }
    //    catch (Exception ex)
    //    {
    //        return StatusCode(500, $"Error interno: {ex.Message}");
    //    }
    //}

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

    [HttpPut("profile/image/default")]
    public async Task<ActionResult> SetDefaultProfileImage()
    {
        try
        {
            int userId = GetUserId();
            await _userService.SetDefaultProfileImageAsync(userId);

            return Ok("Imagen de perfil restablecida correctamente.");
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error al restablecer la imagen: {ex.Message}");
        }
    }

    [HttpPut("auto-ban")]
    public async Task<ActionResult> AutoBan()
    {
        try
        {
            int userId = GetUserId();
            await _userService.AutoBan(userId);

            return Ok("Usuario auto baneado");
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

    [HttpPut("update-user")]
    public async Task<ActionResult> UpdateUser([FromBody] UpdateUserReq updateUserReq)
    {
        try
        {
            int userId = GetUserId();
            string result = await _userService.UpdateUserAsync(userId, updateUserReq);

            if (!string.IsNullOrEmpty(result))
                return BadRequest(new { error = result });

            return Ok("Usuario actualizado correctamente.");
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (Exception)
        {
            return StatusCode(500, "Ocurrió un error inesperado.");
        }
    }


    [HttpGet("get-profile")]
    public async Task<ActionResult<UpdateUserReq>> GetMyProfile()
    {
        try
        {
            int userId = GetUserId();
            UpdateUserReq updateUserReq = await _userService.GetUpdateUser(userId);
            return Ok(updateUserReq);

        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (Exception)
        {
            return StatusCode(500, "Error al obtener los datos del perfil.");
        }
    }


    [HttpPut("set-password")]
    public async Task<ActionResult> SetNewPassword([FromBody] UpdatePasswordReq request)
    {
        try
        {
            int userId = GetUserId();
            string result = await _userService.SetNewPasswordAsync(userId, request);

            if (!string.IsNullOrEmpty(result))
                return BadRequest(new { error = result });

            return Ok("Contraseña actualizada correctamente.");
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (Exception)
        {
            return StatusCode(500, "Ocurrió un error inesperado.");
        }
    }
}