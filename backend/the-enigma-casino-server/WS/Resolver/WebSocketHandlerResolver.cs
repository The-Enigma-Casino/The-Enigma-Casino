using the_enigma_casino_server.WS.Interfaces;

namespace the_enigma_casino_server.WS.Resolver;

public class WebSocketHandlerResolver
{
    private readonly Dictionary<string, IWebSocketMessageHandler> _handlers;

    public WebSocketHandlerResolver(IEnumerable<IWebSocketMessageHandler> handlers)
    {
        _handlers = handlers.ToDictionary(h => h.Type, h => h);
    }

    public IWebSocketMessageHandler? Resolve(string type)
    {
        return _handlers.TryGetValue(type, out var handler) ? handler : null;
    }
}
