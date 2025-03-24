using System.Net.WebSockets;
using System.Text;
using System.Text.Json;
using the_enigma_casino_server.Services;

namespace the_enigma_casino_server.WS.Base;

public abstract class BaseWebSocketHandler : WebSocketService
{
    protected BaseWebSocketHandler(ConnectionManagerWS connectionManager, IServiceProvider serviceProvider)
        : base(connectionManager, serviceProvider)
    {

    }

    protected T GetScopedService<T>(out IServiceScope scope)
    {
        scope = _serviceProvider.CreateScope();
        return scope.ServiceProvider.GetRequiredService<T>();
    }

    protected async Task SendToUserAsync(string userId, object payload)
    {
        WebSocket? socket = _connectionManager.GetConnectionById(userId);
        if (socket is { State: WebSocketState.Open })
        {
            string json = JsonSerializer.Serialize(payload);
            byte[] buffer = Encoding.UTF8.GetBytes(json);
            await socket.SendAsync(new ArraySegment<byte>(buffer), WebSocketMessageType.Text, true, CancellationToken.None);
        }
    }

    protected async Task BroadcastToUsersAsync(IEnumerable<string> userIds, object payload)
    {
        foreach (string userId in userIds)
        {
            await SendToUserAsync(userId, payload);
        }
    }
}