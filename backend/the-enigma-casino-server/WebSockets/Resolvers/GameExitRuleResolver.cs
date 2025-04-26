namespace the_enigma_casino_server.WebSockets.Resolversl;

using the_enigma_casino_server.Games.Shared.Enum;
using the_enigma_casino_server.WebSockets.BlackJack;
using the_enigma_casino_server.WebSockets.Interfaces;
using the_enigma_casino_server.WebSockets.Poker;

public class GameExitRuleResolver
{
    private readonly IServiceProvider _provider;

    public GameExitRuleResolver(IServiceProvider provider)
    {
        _provider = provider;
    }

    public IGameExitRuleHandler Resolve(GameType gameType)
    {
        return gameType switch
        {
            GameType.BlackJack => _provider.GetRequiredService<BlackjackExitRuleHandler>(),
            GameType.Poker => _provider.GetRequiredService<PokerExitRuleHandler>(),
           // GameType.Roulette => _provider.GetRequiredService<RouletteExitRuleHandler>(),
            _ => throw new NotSupportedException($"GameType {gameType} no soportado en GameExitRuleResolver.")
        };
    }
}