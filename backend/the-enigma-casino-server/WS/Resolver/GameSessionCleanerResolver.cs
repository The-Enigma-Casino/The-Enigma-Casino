using the_enigma_casino_server.Games.Shared.Entities.Enum;
using the_enigma_casino_server.WS.Interfaces;
using the_enigma_casino_server.WS.BlackJackWS;

namespace the_enigma_casino_server.WS.Resolver;

public class GameSessionCleanerResolver
{
    private readonly BlackjackSessionCleaner _blackjackCleaner;
    // private readonly PokerSessionCleaner _pokerCleaner;

    public GameSessionCleanerResolver(BlackjackSessionCleaner blackjackCleaner /*, ... */)
    {
        _blackjackCleaner = blackjackCleaner;
    }

    public IGameSessionCleaner? Resolve(GameType gameType)
    {
        return gameType switch
        {
            GameType.BlackJack => _blackjackCleaner,
            // GameType.Poker => _pokerCleaner,
            _ => null
        };
    }
}
