using the_enigma_casino_server.Games.Shared.Entities;
using the_enigma_casino_server.Games.Shared.Entities.Enum;
using the_enigma_casino_server.Models.Database;

namespace the_enigma_casino_server.Games.Shared.Services;

public class GameSessionService
{

    private readonly UnitOfWork _unitOfWork;
    private readonly GameMatchService _gameMatchService;

    public GameSessionService(UnitOfWork unitOfWork, GameMatchService gameMatchService)
    {
        _unitOfWork = unitOfWork;
        _gameMatchService = gameMatchService;
    }


    public async Task<GameSession> CreateGameSession(GameType gameType, int maxPlayers, int minPlayers)
    {
        GameSession existingSession = await _unitOfWork.GameSessionRepository.GetSessionByGameTypeAsync(gameType);

        if (existingSession != null)
        {
            return existingSession;
        }

        GameSession gameSession = new GameSession
        {
            GameType = gameType,
            MaxPlayer = maxPlayers,
            MinPlayer = minPlayers,
            CreatedAt = DateTime.UtcNow,
        };

        await _unitOfWork.GameSessionRepository.InsertAsync(gameSession);
        await _unitOfWork.SaveAsync();

        return gameSession;
    }



    public async Task<bool> AddPlayerToSessionAsync(int sessionId, int userId)
    {
        GameSession existingSession = await _unitOfWork.GameSessionRepository.GetSessionByPlayerIdAsync(userId);

        if (existingSession != null && existingSession.IsWaiting)
        {
            return false;
        }

        GameSession session = await _unitOfWork.GameSessionRepository.GetByIdAsync(sessionId);
        if (session == null || !session.IsWaiting) return false;

        if (session.Players.Any(p => p.UserId == userId))
        {
            return false;
        }

        Player newPlayer = new Player
        {
            UserId = userId,
            GameSessionId = session.Id,
            PlayerState = PlayerState.Waiting
        };

        session.Players.Add(newPlayer);
        _unitOfWork.GameSessionRepository.Update(session);
        await _unitOfWork.SaveAsync();

        return true;
    }


    public async Task<GameMatch> TryStartMatchAsync(int sessionId)
    {
        var session = await _unitOfWork.GameSessionRepository.GetByIdAsync(sessionId);
        if (session == null || session.Players.Count < session.MinPlayer) return null;

        session.IsWaiting = false;
        _unitOfWork.GameSessionRepository.Update(session);

        return await _gameMatchService.CreateGameMatch(session);
    }
}

