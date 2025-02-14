using Microsoft.AspNetCore.Mvc;

namespace the_enigma_casino_server.Controllers;

[Route("api/[controller]")]
[ApiController]
public abstract class BaseController : ControllerBase
{
    protected int GetUserId()
    {
        var userIdClaim = User.FindFirst("id");
        if (userIdClaim == null)
        {
            throw new UnauthorizedAccessException("Usuario no autenticado");
        }
        return int.Parse(userIdClaim.Value);
    }
}

