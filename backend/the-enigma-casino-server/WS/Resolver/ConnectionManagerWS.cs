using System.Collections.Concurrent;
using System.Net.WebSockets;

namespace the_enigma_casino_server.WS.Resolver;

public class ConnectionManagerWS
{
    private readonly ConcurrentDictionary<string, WebSocket> _connections = new();

    public event Action<string> OnUserDisconnected;

    public void AddConnection(string userId, WebSocket webSocket)
    {
        if (_connections.TryGetValue(userId, out var existingSocket))
        {
            if (existingSocket.State == WebSocketState.Open || existingSocket.State == WebSocketState.Connecting)
            {
                try
                {
                    existingSocket.Abort();
                    existingSocket.Dispose();
                    Console.WriteLine($"🔁 Reemplazada conexión previa de {userId}");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"❌ Error cerrando WebSocket anterior para {userId}: {ex.Message}");
                }
            }
        }

        _connections[userId] = webSocket;
        Console.WriteLine($"✅ Conexión WebSocket activa para {userId}");
    }

    public async Task RemoveConnectionAsync(string userId)
    {
        if (_connections.TryRemove(userId, out var socket))
        {
            try
            {
                if (socket.State == WebSocketState.Open)
                {
                    await socket.CloseAsync(WebSocketCloseStatus.NormalClosure, "Cierre limpio", CancellationToken.None);
                }
                socket.Dispose();
                Console.WriteLine($"❎ Conexión eliminada para {userId}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error al cerrar conexión de {userId}: {ex.Message}");
            }

            OnUserDisconnected?.Invoke(userId);
        }
    }


    public bool TryGetConnection(string userId, out WebSocket webSocket)
    {
        return _connections.TryGetValue(userId, out webSocket);
    }

    public WebSocket GetConnectionById(string userId)
    {
        return _connections.TryGetValue(userId, out var socket) ? socket : null;
    }

    public IEnumerable<WebSocket> GetAllConnections()
    {
        return _connections.Values;
    }
}
