
using the_enigma_casino_server.Websockets.Roulette;
using the_enigma_casino_server.WebSockets.BlackJack;
using the_enigma_casino_server.WebSockets.Chat;
using the_enigma_casino_server.WebSockets.Friends;
using the_enigma_casino_server.WebSockets.GameMatch;
using the_enigma_casino_server.WebSockets.GameTable;
using the_enigma_casino_server.WebSockets.Interfaces;
using the_enigma_casino_server.WebSockets.Poker;


namespace the_enigma_casino_server.WebSockets.Resolvers;
public class WebSocketHandlerResolver
{
    private readonly IServiceProvider _serviceProvider;

    public WebSocketHandlerResolver(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    public IWebSocketMessageHandler Resolve(string type)
    {
        using var scope = _serviceProvider.CreateScope();
        var provider = scope.ServiceProvider;

        return type switch
        {
            "game_table" => provider.GetRequiredService<GameTableWS>(),
            "game_match" => provider.GetRequiredService<GameMatchWS>(),
            "blackjack" => provider.GetRequiredService<BlackjackWS>(),
            "poker" => provider.GetRequiredService<PokerWS>(),
            "roulette" => provider.GetRequiredService<RouletteWS>(),
            "friend" => _serviceProvider.GetRequiredService<FriendsWS>(),
            "chat" => provider.GetRequiredService<GameChatWS>(),
            _ => null
        };
    }
}
