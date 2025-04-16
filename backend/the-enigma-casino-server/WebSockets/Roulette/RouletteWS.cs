using System.Text.Json;
using the_enigma_casino_server.WebSockets.Base;
using the_enigma_casino_server.WebSockets.Interfaces;

namespace the_enigma_casino_server.Websockets.Roulette;

public class RouletteWS : BaseWebSocketHandler, IWebSocketMessageHandler, IGameTurnService
{
    public string Type => "roulette";

    public RouletteWS(ConnectionManagerWS connectionManagerWS, IServiceProvider serviceProvider) : base(connectionManagerWS, serviceProvider) { }


    public async Task HandleAsync(string userId, JsonElement message)
    {
        if (message.TryGetProperty("action", out JsonElement actionProp))
        {
            string action = actionProp.GetString();
            await (action switch {
                RouletteMessageType.PlaceBet => HandlePlaceBetAsync(userId, message),
                RouletteMessageType.Spin => HandleSpinAsync(userId, message),
                _ => Task.CompletedTask
            });

        }
    }

    public Task ForceAdvanceTurnAsync(int tableId, int userId)
    {
        // En ruleta normalmente no hay turnos, pero dejamos esto por compatibilidad
        return Task.CompletedTask;
    }

    private Task HandlePlaceBetAsync(string userId, JsonElement message)
    {
        // Lo haremos en el próximo paso
        return Task.CompletedTask;
    }

    private Task HandleSpinAsync(string userId, JsonElement message)
    {
        // Lo haremos luego
        return Task.CompletedTask;
    }
}
