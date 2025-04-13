using Microsoft.AspNetCore.Mvc;
using System.Net.WebSockets;
using the_enigma_casino_server.Infrastructure.Database;

using the_enigma_casino_server.WebSockets.Base;

namespace the_enigma_casino_server.Controllers;

[ApiController]
[ApiExplorerSettings(IgnoreApi = true)]
public class WebSocketController : ControllerBase
{
    private readonly WebSocketService _websocketService;
    private readonly UnitOfWork _unitOfWork;

    public WebSocketController(WebSocketService websocketService, UnitOfWork unitOfWork)
    {
        _websocketService = websocketService;
        _unitOfWork = unitOfWork;
    }

    [Route("/socket")] 
    public async Task Get()
    {
        if (HttpContext.WebSockets.IsWebSocketRequest)
        {
            string userId = HttpContext.Request.Query["userId"];

            if (!string.IsNullOrEmpty(userId))
            {
                var user = await _unitOfWork.UserRepository.GetByIdAsync(int.Parse(userId));
                if (user == null)
                {
                    HttpContext.Response.StatusCode = StatusCodes.Status400BadRequest;
                    await HttpContext.Response.WriteAsync("Usuario no encontrado.");
                    return;
                }

                WebSocket webSocket = await HttpContext.WebSockets.AcceptWebSocketAsync();
                await _websocketService.HandleAsync(webSocket, userId);
            }
            else
            {
                HttpContext.Response.StatusCode = StatusCodes.Status400BadRequest;
                await HttpContext.Response.WriteAsync("Se necesita un UserId");
            }
        }
        else
        {
            HttpContext.Response.StatusCode = StatusCodes.Status400BadRequest;
            await HttpContext.Response.WriteAsync("No es una solicitud WebSocket");
        }
    }
}
