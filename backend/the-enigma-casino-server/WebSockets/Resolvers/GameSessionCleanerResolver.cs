using the_enigma_casino_server.Games.Shared.Enum;
using the_enigma_casino_server.WebSockets.BlackJack;
using the_enigma_casino_server.WebSockets.Poker;
using the_enigma_casino_server.WebSockets.Interfaces;

namespace the_enigma_casino_server.WebSockets.Resolvers;

public class GameSessionCleanerResolver
{
    private readonly BlackjackSessionCleaner _blackjackCleaner;
    private readonly PokerSessionCleaner _pokerCleaner;

    public GameSessionCleanerResolver(BlackjackSessionCleaner blackjackCleaner, PokerSessionCleaner pokerSessionCleaner)
    {
        _blackjackCleaner = blackjackCleaner;
        _pokerCleaner = pokerSessionCleaner;
    }

    public IGameSessionCleaner Resolve(GameType gameType)
    {
        return gameType switch
        {
            GameType.BlackJack => _blackjackCleaner,
            GameType.Poker => _pokerCleaner,
            _ => null
        };
    }
}
