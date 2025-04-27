using the_enigma_casino_server.Games.Shared.Enum;
using the_enigma_casino_server.WebSockets.BlackJack;
using the_enigma_casino_server.WebSockets.Poker;
using the_enigma_casino_server.WebSockets.Interfaces;
using the_enigma_casino_server.WebSockets.Roulette;

namespace the_enigma_casino_server.WebSockets.Resolvers;

public class GameJoinHelperResolver
{
    private readonly BlackjackJoinHelper _blackjackHelper;
    private readonly PokerJoinHelper _pokerHelper;
    private readonly RouletteJoinHelper _rouletteHelper;

    public GameJoinHelperResolver(BlackjackJoinHelper blackjackHelper, PokerJoinHelper pokerHelper, RouletteJoinHelper rouletteHelper)
    {
        _blackjackHelper = blackjackHelper;
        _pokerHelper = pokerHelper;
        _rouletteHelper = rouletteHelper;
    }

    public IGameJoinHelper Resolve(GameType gameType)
    {
        return gameType switch
        {
            GameType.BlackJack => _blackjackHelper,
            GameType.Poker => _pokerHelper,
            GameType.Roulette => _rouletteHelper,
            _ => null
        };
    }
}
