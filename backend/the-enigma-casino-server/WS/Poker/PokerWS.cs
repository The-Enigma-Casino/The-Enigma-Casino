using System.Text.Json;
using the_enigma_casino_server.WS.Base;
using the_enigma_casino_server.WS.Interfaces;
using the_enigma_casino_server.WS.Resolver;

namespace the_enigma_casino_server.WS.PokerWS;

public class PokerWS : BaseWebSocketHandler, IWebSocketMessageHandler
{
    public string Type => "poker";

    public PokerWS(ConnectionManagerWS connectionManager, IServiceProvider serviceProvider)
        : base(connectionManager, serviceProvider)
    {

    }

    public async Task HandleAsync(string userId, JsonElement message)
    {
        if (message.TryGetProperty("action", out JsonElement actionProp))
        {
            string action = actionProp.GetString()!;

            await (action switch
            {
                PokerMessageType.PlaceBet => HandlePlaceBetAsync(userId, message),
                PokerMessageType.PlayerAction => HandlePlayerActionAsync(userId, message),
                PokerMessageType.DealFlop => HandleDealFlopAsync(message),
                PokerMessageType.DealTurn => HandleDealTurnAsync(message),
                PokerMessageType.DealRiver => HandleDealRiverAsync(message),
                PokerMessageType.Showdown => HandleShowdownAsync(message),
                _ => Task.CompletedTask
            });
        }
    }

    private Task HandlePlaceBetAsync(string userId, JsonElement message) => Task.CompletedTask;
    private Task HandlePlayerActionAsync(string userId, JsonElement message) => Task.CompletedTask;
    private Task HandleDealFlopAsync(JsonElement message) => Task.CompletedTask;
    private Task HandleDealTurnAsync(JsonElement message) => Task.CompletedTask;
    private Task HandleDealRiverAsync(JsonElement message) => Task.CompletedTask;
    private Task HandleShowdownAsync(JsonElement message) => Task.CompletedTask;
}
