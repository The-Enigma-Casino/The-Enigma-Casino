namespace the_enigma_casino_server.WebSockets.Resolvers;

using the_enigma_casino_server.Games.Shared.Enum;
using the_enigma_casino_server.WebSockets.BlackJack;
using the_enigma_casino_server.WebSockets.Interfaces;
using the_enigma_casino_server.WebSockets.Poker;

public class GameBetInfoProviderResolver
{
    private readonly BlackjackBetInfoProvider _blackjackProvider;
     private readonly PokerBetInfoProvider _pokerProvider;
    // private readonly RouletteBetInfoProvider _rouletteProvider;

    public GameBetInfoProviderResolver(BlackjackBetInfoProvider blackjackProvider, PokerBetInfoProvider pokerProvider)
    {
        _blackjackProvider = blackjackProvider;
         _pokerProvider = pokerProvider;
        // _rouletteProvider = rouletteProvider;
    }

    public IGameBetInfoProvider Resolve(GameType gameType)
    {
        return gameType switch
        {
            GameType.BlackJack => _blackjackProvider,
             GameType.Poker => _pokerProvider,
            // GameType.Roulette => _rouletteProvider,
            _ => throw new NotSupportedException($"Juego no soportado: {gameType}")
        };
    }
}