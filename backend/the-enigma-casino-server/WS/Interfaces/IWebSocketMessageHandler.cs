using System.Text.Json;

namespace the_enigma_casino_server.WS.Interfaces;

public interface IWebSocketMessageHandler
{
    string Type { get; }
    Task HandleAsync(string userId, JsonElement message);
}
