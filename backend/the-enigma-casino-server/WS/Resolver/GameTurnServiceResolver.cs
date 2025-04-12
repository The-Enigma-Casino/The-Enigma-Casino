using the_enigma_casino_server.Games.Shared.Entities.Enum;
using the_enigma_casino_server.WS.BlackJack;
using the_enigma_casino_server.WS.Interfaces;
using the_enigma_casino_server.WS.PokerWS;

namespace the_enigma_casino_server.WS.Resolver;

public class GameTurnServiceResolver
{
    private readonly BlackjackTurnService _blackjackTurnService;
    private readonly PokerTurnService _pokerTurnService;

    public GameTurnServiceResolver(BlackjackTurnService blackjackTurnService, PokerTurnService pokerTurnService)
    {
        _blackjackTurnService = blackjackTurnService;
        _pokerTurnService = pokerTurnService;
    }

    public IGameTurnService? Resolve(GameType gameType)
    {
        return gameType switch
        {
            GameType.BlackJack => _blackjackTurnService,
            GameType.Poker => _pokerTurnService,
            _ => null // ruleta no necesita turnos
        };
    }
}