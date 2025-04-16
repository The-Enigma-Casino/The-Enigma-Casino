using the_enigma_casino_server.Games.Shared.Enum;
using the_enigma_casino_server.WebSockets.BlackJack;
using the_enigma_casino_server.WebSockets.Interfaces;
using the_enigma_casino_server.WebSockets.Poker;

namespace the_enigma_casino_server.WebSockets.Resolvers;

public class GameTurnServiceResolver
{
    private readonly BlackjackTurnService _blackjackTurnService;
    private readonly PokerTurnService _pokerTurnService;

    public GameTurnServiceResolver(BlackjackTurnService blackjackTurnService, PokerTurnService pokerTurnService)
    {
        _blackjackTurnService = blackjackTurnService;
        _pokerTurnService = pokerTurnService;
    }

    public IGameTurnService Resolve(GameType gameType)
    {
        return gameType switch
        {
            GameType.BlackJack => _blackjackTurnService,
            GameType.Poker => _pokerTurnService,
            _ => null // ruleta no necesita turnos
        };
    }
}