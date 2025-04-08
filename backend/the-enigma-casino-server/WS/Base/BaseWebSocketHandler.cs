using System.Net.WebSockets;
using System.Text;
using System.Text.Json;
using the_enigma_casino_server.Services;
using the_enigma_casino_server.WS.Resolver;

namespace the_enigma_casino_server.WS.Base;

public abstract class BaseWebSocketHandler : WebSocketService, IWebSocketSender
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

    async Task IWebSocketSender.SendToUserAsync(string userId, object payload)
    {
        WebSocket? socket = _connectionManager.GetConnectionById(userId);

        if (socket == null || socket.State != WebSocketState.Open)
        {
            Console.WriteLine($"[WS] 🔌 WebSocket de {userId} no está abierto (estado: {socket?.State}), eliminando conexión...");
            await _connectionManager.RemoveConnectionAsync(userId);
            return;
        }

        try
        {
            string json = JsonSerializer.Serialize(payload);
            byte[] buffer = Encoding.UTF8.GetBytes(json);

            await socket.SendAsync(
                new ArraySegment<byte>(buffer),
                WebSocketMessageType.Text,
                endOfMessage: true,
                cancellationToken: CancellationToken.None
            );
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[WS] ⚠️ Error enviando a {userId}: {ex.Message} — eliminando conexión");
            await _connectionManager.RemoveConnectionAsync(userId);
        }
    }

    public async Task SendErrorAsync(string userId, string errorMessage)
    {
        var error = new
        {
            type = "error",
            message = errorMessage
        };

        await ((IWebSocketSender)this).SendToUserAsync(userId, error);
    }

    async Task IWebSocketSender.BroadcastToUsersAsync(IEnumerable<string> userIds, object payload)
    {
        foreach (string userId in userIds)
        {
            await ((IWebSocketSender)this).SendToUserAsync(userId, payload);
        }
    }
}
