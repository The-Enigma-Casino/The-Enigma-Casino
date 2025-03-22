using the_enigma_casino_server.Games.Shared.Entities.Enum;
using the_enigma_casino_server.Games.Shared.Entities;
using the_enigma_casino_server.Models.Database;

namespace the_enigma_casino_server.Games.Shared.Services;

public class GameMatchService
{

    private readonly UnitOfWork _unitOfWork;

    public GameMatchService(UnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }


    public async Task<GameMatch> CreateGameMatch(GameSession gameSession) //TODO: minimo de jugadores   CREAR EN PANTALLA DE CARGA
    {
        if (gameSession == null) throw new ArgumentNullException(nameof(gameSession));

        GameMatch gameMatch = new GameMatch
        {
            GameSessionId = gameSession.Id,
            GameSession = gameSession,
            GameState = GameState.Waiting,
            StartedAt = DateTime.UtcNow,
        };

        if (gameSession.GameType == GameType.BlackJack || gameSession.GameType == GameType.Poker)
        {
            //Deck deck = await _deckService.CreateDeck(gameMatch);
            //gameMatch.DeckId = deck.Id;
            //gameMatch.Deck = deck;
        }

        await _unitOfWork.GameMatchRepository.InsertAsync(gameMatch);
        await _unitOfWork.SaveAsync();

        return gameMatch;
    }
}
