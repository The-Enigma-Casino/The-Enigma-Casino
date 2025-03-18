using the_enigma_casino_server.Games.Entities;
using the_enigma_casino_server.Games.Entities.Enum;
using the_enigma_casino_server.Models.Database;

namespace the_enigma_casino_server.Games.BlackJack.Services;

public class GameSessionService
{

    private readonly UnitOfWork _unitOfWork;
    private readonly DeckService _deckService;

    public GameSessionService(UnitOfWork unitOfWork, DeckService deckService)
    {
        _unitOfWork = unitOfWork;
        _deckService = deckService;
    }


    public async Task<GameSession> CreateGameSession(GameType gameType, int maxPlayers, int minPlayers) //TODO: minimo de jugadores   CREAR EN PANTALLA DE CARGA
    {
        GameSession gameSession = new GameSession
        {
            GameType = gameType,
            MaxPlayer = maxPlayers,
            MinPlayer = minPlayers,
            GameState = GameState.Waiting,
            CreatedAt = DateTime.UtcNow,
        };

        if (gameType == GameType.BlackJack || gameType ==  GameType.Poker)
        {
            Deck deck = await _deckService.CreateDeck(gameSession);

            gameSession.DeckId = deck.Id;
        }

        await _unitOfWork.GameSessionRepository.InsertAsync(gameSession);
        await _unitOfWork.SaveAsync();

        return gameSession;
    }


}
