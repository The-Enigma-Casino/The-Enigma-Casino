namespace the_enigma_casino_server.WebSockets.Resolvers;

using the_enigma_casino_server.Games.Shared.Enum;
using the_enigma_casino_server.Websockets.Roulette;
using the_enigma_casino_server.WebSockets.BlackJack;
using the_enigma_casino_server.WebSockets.Interfaces;

public class GameInactivityTrackerResolver
{
    private readonly IServiceProvider _provider;

    public GameInactivityTrackerResolver(IServiceProvider provider)
    {
        _provider = provider;
    }

    public IGameInactivityTracker? Resolve(GameType gameType)
    {
        return gameType switch
        {
            GameType.BlackJack => _provider.GetRequiredService<BlackjackInactivityTracker>(),
            GameType.Roulette => _provider.GetRequiredService<RouletteInactivityTracker>(),
            _ => null
        };
    }
}
