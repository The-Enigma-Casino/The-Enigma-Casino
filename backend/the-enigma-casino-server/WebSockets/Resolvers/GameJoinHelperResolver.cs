using the_enigma_casino_server.Games.Shared.Enum;
using the_enigma_casino_server.WebSockets.BlackJack;
using the_enigma_casino_server.WebSockets.Poker;
using the_enigma_casino_server.WebSockets.Interfaces;

namespace the_enigma_casino_server.WebSockets.Resolvers;

public class GameJoinHelperResolver
{
    private readonly BlackjackJoinHelper _blackjackHelper;
    private readonly PokerJoinHelper _pokerHelper;

    public GameJoinHelperResolver(BlackjackJoinHelper blackjackHelper, PokerJoinHelper pokerHelper)
    {
        _blackjackHelper = blackjackHelper;
        _pokerHelper = pokerHelper;
    }

    public IGameJoinHelper Resolve(GameType gameType)
    {
        return gameType switch
        {
            GameType.BlackJack => _blackjackHelper,
            GameType.Poker => _pokerHelper,
            _ => null
        };
    }
}
