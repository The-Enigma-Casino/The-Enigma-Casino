using System.Collections.Concurrent;
using System.Net.WebSockets;

namespace the_enigma_casino_server.WS;

public class ConnectionManagerWS
{
    private readonly ConcurrentDictionary<string, WebSocket> _connections = new();

    public void AddConnection(string userId, WebSocket webSocket)
    {
        _connections[userId] = webSocket;
    }

    public void RemoveConnection(string userId)
    {
        _connections.TryRemove(userId, out _);  
    }

    public bool TryGetConnection(string userId, out WebSocket webSocket)
    {
        return _connections.TryGetValue(userId, out webSocket);
    }

    public WebSocket GetConnectionById(string userId)
    {
        return _connections.TryGetValue(userId, out WebSocket socket) ? socket : null;
    }

    public IEnumerable<WebSocket> GetAllConnections()
    {
        return _connections.Values;
    }
}
