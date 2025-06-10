using Microsoft.AspNetCore.Mvc;
using the_enigma_casino_server.WebSockets.Base;

namespace the_enigma_casino_server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OnlineUsersController : BaseController
{
    private readonly ConnectionManagerWS _connectionManager;

    public OnlineUsersController(ConnectionManagerWS connectionManager)
    {
        _connectionManager = connectionManager;
    }

    [HttpGet("count")]
    public IActionResult GetOnlineUsersCount()
    {
        int count = _connectionManager.GetAllConnections().Count();
        return Ok(new { onlineUsers = count });
    }
}
