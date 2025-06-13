
using System.Collections.Concurrent;
using System.Net.WebSockets;
using the_enigma_casino_server.Core.Entities.Enum;

namespace the_enigma_casino_server.WebSockets.Base;

public class ConnectionManagerWS
{
    private readonly ConcurrentDictionary<string, WebSocket> _connections = new();

    private readonly ConcurrentDictionary<string, int> _reconnectAttempts = new();
    private const int MaxReconnectAttempts = 5;


    public event Action<string> OnUserDisconnected;
    public event Action<string> OnUserConnected;
    public event Action<string> OnUserStatusChanged;

    public void AddConnection(string userId, WebSocket webSocket)
    {
        if (_connections.TryGetValue(userId, out var existingSocket))
        {
            if (existingSocket.State == WebSocketState.Open || existingSocket.State == WebSocketState.Connecting)
            {
                if (_reconnectAttempts.TryGetValue(userId, out var attempts) && attempts >= MaxReconnectAttempts)
                {
                    try
                    {
                        webSocket.Abort();
                        webSocket.Dispose();
                    }
                    catch { }

                    return;
                }
            }
        }

        _connections[userId] = webSocket;
        _reconnectAttempts.AddOrUpdate(userId, 1, (_, current) => current + 1);

        OnUserConnected?.Invoke(userId);

        if (int.TryParse(userId, out int id))
        {
            UserStatusStore.SetStatus(id, UserStatus.Online);
        }
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
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error al cerrar conexión de {userId}: {ex.Message}");
            }

            if (int.TryParse(userId, out int id))
            {
                UserStatusStore.SetStatus(id, UserStatus.Offline);
            }

            _reconnectAttempts.TryRemove(userId, out _);
            var handler = OnUserDisconnected;
            handler?.Invoke(userId);
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

    public bool IsUserConnected(string userId)
    {
        return _connections.TryGetValue(userId, out var socket)
               && socket.State == WebSocketState.Open;
    }

    public List<int> GetAllConnectedUserIds()
    {
        return _connections.Keys
            .Select(key => int.TryParse(key, out int id) ? id : (int?)null)
            .Where(id => id.HasValue)
            .Select(id => id.Value)
            .ToList();
    }
    public void RaiseUserStatusUpdated(string userId)
    {
        OnUserConnected?.Invoke(userId);
    }

    public void RaiseUserStatusChanged(string userId)
    {
        OnUserStatusChanged?.Invoke(userId);
    }
}