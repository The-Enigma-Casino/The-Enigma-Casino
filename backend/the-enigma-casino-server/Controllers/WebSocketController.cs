using Microsoft.AspNetCore.Mvc;
using System.Net.WebSockets;
using the_enigma_casino_server.Models.Database;
using the_enigma_casino_server.Models.Database.Entities;
using the_enigma_casino_server.Services;

namespace the_enigma_casino_server.Controllers;

[Route("socket")]
[ApiController]
public class WebSocketController : ControllerBase
{
    private readonly WebSocketService _websocketService;
    private readonly UnitOfWork _unitOfWork;

    public WebSocketController(WebSocketService websocketService, UnitOfWork unitOfWork)
    {
        _websocketService = websocketService;
        _unitOfWork = unitOfWork;
    }

    [HttpGet]
    //[Authorize]
    public async Task ConnectAsync()
    {
        {
            if (HttpContext.WebSockets.IsWebSocketRequest)
            {
                string userId = HttpContext.Request.Query["userId"];


                if (!string.IsNullOrEmpty(userId))
                {
                    User user = await _unitOfWork.UserRepository.GetByIdAsync(int.Parse(userId));
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
            }
        }
    }
}