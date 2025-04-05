using System.Text.Json;
using the_enigma_casino_server.WS.Base;
using the_enigma_casino_server.WS.Interfaces;

namespace the_enigma_casino_server.WS.GameWS;

public class GameMatchWS : BaseWebSocketHandler, IWebSocketMessageHandler
{
    public string Type => "gameMatch";

    public GameMatchWS(ConnectionManagerWS connectionManager, IServiceProvider serviceProvider)
        : base(connectionManager, serviceProvider)
    {
    }

    public Task HandleAsync(string userId, JsonElement message)
    {
        Console.WriteLine($"[GameMatchWS] Mensaje recibido de {userId}: {message}");
        return Task.CompletedTask;
    }
}
