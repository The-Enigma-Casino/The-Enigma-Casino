namespace the_enigma_casino_server.WS.Resolver;

using the_enigma_casino_server.Games.Shared.Entities.Enum;
using the_enigma_casino_server.WS.BlackJack;
using the_enigma_casino_server.WS.Interfaces;

public class GameBetInfoProviderResolver
{
    private readonly BlackjackBetInfoProvider _blackjackProvider;
    // private readonly PokerBetInfoProvider _pokerProvider;
    // private readonly RouletteBetInfoProvider _rouletteProvider;

    public GameBetInfoProviderResolver(BlackjackBetInfoProvider blackjackProvider)
    {
        _blackjackProvider = blackjackProvider;
        // _pokerProvider = pokerProvider;
        // _rouletteProvider = rouletteProvider;
    }

    public IGameBetInfoProvider Resolve(GameType gameType)
    {
        return gameType switch
        {
            GameType.BlackJack => _blackjackProvider,
            // GameType.Poker => _pokerProvider,
            // GameType.Roulette => _rouletteProvider,
            _ => throw new NotSupportedException($"Juego no soportado: {gameType}")
        };
    }
}