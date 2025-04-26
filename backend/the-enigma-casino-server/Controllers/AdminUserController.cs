using Microsoft.AspNetCore.Mvc;
using the_enigma_casino_server.Application.Dtos;
using the_enigma_casino_server.Application.Services;
using Microsoft.AspNetCore.Authorization;
using the_enigma_casino_server.Core.Entities.Enum;

namespace the_enigma_casino_server.Controllers;


[Route("api/[controller]")]
[ApiController]
[Authorize(Roles = "Admin")]
public class AdminUserController : BaseController
{
    private readonly AdminUserService _adminUserService;

    public AdminUserController(AdminUserService adminUserService)
    {
        _adminUserService = adminUserService;
    }

    [HttpGet("users")]
    public async Task<ActionResult<List<UserAdminDto>>> GetUsers()
    {
        try
        {
            List<UserAdminDto> users = await _adminUserService.GetUsersAsync();
            return Ok(users);
        }
        catch (Exception ex)
        {
            return StatusCode(500, "Un error ha ocurrido al enviar su petición.");
        }
    }


    [HttpPut("update-role/{id}")]
    public async Task<ActionResult> UpdateRolById(int id)
    {
        try
        {
            int adminId = GetUserId();

            if (adminId == id)
                return BadRequest("No puedes cambiar tu propio rol.");

            Role role = await _adminUserService.UpdateRolById(id);
            string message = role == Role.Admin ? "Rol actualizado a Admin correctamente." : "Rol actualizado a User correctamente.";
            return Ok(message);
        }
        catch (Exception ex)
        {
            return StatusCode(500, "Un error ha ocurrido al enviar su petición.");
        }
    }

    [HttpPut("ban-user/{id}")]
    public async Task<ActionResult> BanUserById(int id)
    {
        try
        {
            int adminId = GetUserId();

            if (adminId == id)
                return BadRequest("No puedes banearte a ti mismo.");

            Role role = await _adminUserService.BanUserById(id);

            string message = role == Role.Banned ? "Usuario baneado correctamente." : "Usuario desbaneado correctamente.";
            return Ok(message);
        }
        catch (Exception ex)
        {
            return StatusCode(500, "Un error ha ocurrido al enviar su petición.");
        }
    }

    [HttpGet("search-users")]
    public async Task<ActionResult<List<UserAdminDto>>> SearchUsersByNickName([FromQuery] string nickName)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(nickName))
                return BadRequest("Debe ingresar un NickName para buscar.");

            List<UserAdminDto> users = await _adminUserService.SearchUsersByNickName(nickName);
            return Ok(users);
        }
        catch (Exception ex)
        {
            return StatusCode(500, "Un error ha ocurrido al enviar su petición.");
        }
    }

}
