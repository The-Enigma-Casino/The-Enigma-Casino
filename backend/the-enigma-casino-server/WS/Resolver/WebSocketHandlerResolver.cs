using the_enigma_casino_server.WS.BlackJackWS;
using the_enigma_casino_server.WS.PokerWS;
using the_enigma_casino_server.WS.GameMatch;
using the_enigma_casino_server.WS.GameTable;
using the_enigma_casino_server.WS.Interfaces;


namespace the_enigma_casino_server.WS.Resolver;
public class WebSocketHandlerResolver
{
    private readonly IServiceProvider _serviceProvider;

    public WebSocketHandlerResolver(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    public IWebSocketMessageHandler? Resolve(string type)
    {
        using var scope = _serviceProvider.CreateScope();
        var provider = scope.ServiceProvider;

        return type switch
        {
            "game_table" => provider.GetRequiredService<GameTableWS>(),
            "game_match" => provider.GetRequiredService<GameMatchWS>(),
            "blackjack" => provider.GetRequiredService<BlackjackWS>(),
            "poker" => provider.GetRequiredService<PokerWS>(),
            _ => null
        };
    }
}
