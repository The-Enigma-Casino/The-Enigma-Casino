using the_enigma_casino_server.Games.Shared.Enum;
using the_enigma_casino_server.WebSockets.BlackJack;
using the_enigma_casino_server.WebSockets.Poker;
using the_enigma_casino_server.WebSockets.Interfaces;
using the_enigma_casino_server.Websockets.Roulette;

namespace the_enigma_casino_server.WebSockets.Resolvers;

public class GameSessionCleanerResolver
{
    private readonly BlackjackSessionCleaner _blackjackCleaner;
    private readonly PokerSessionCleaner _pokerCleaner;
    private readonly RouletteSessionCleaner _rouletteCleaner;

    public GameSessionCleanerResolver(BlackjackSessionCleaner blackjackCleaner, PokerSessionCleaner pokerSessionCleaner, RouletteSessionCleaner rouletteSessionCleaner)
    {
        _blackjackCleaner = blackjackCleaner;
        _pokerCleaner = pokerSessionCleaner;
        _rouletteCleaner = rouletteSessionCleaner;
    }

    public IGameSessionCleaner Resolve(GameType gameType)
    {
        return gameType switch
        {
            GameType.BlackJack => _blackjackCleaner,
            GameType.Poker => _pokerCleaner,
            GameType.Roulette => _rouletteCleaner,
            _ => null
        };
    }
}
