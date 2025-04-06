using the_enigma_casino_server.Games.Shared.Entities;
using the_enigma_casino_server.Models.Database;
using the_enigma_casino_server.Games.Shared.Repositories;
using the_enigma_casino_server.Games.Shared.Entities.Enum;

namespace the_enigma_casino_server.WS.GameMatch;

public class GameMatchManager
{
    private readonly UnitOfWork _unitOfWork;

    public GameMatchManager(UnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Match?> StartMatchAsync(Table table)
    {
        if (table.Players.Count < table.MinPlayer)
        {
            Console.WriteLine($"❌ [GameMatchManager] Jugadores insuficientes para iniciar la partida en mesa {table.Id}.");
            return null;
        }

        foreach (var player in table.Players)
        {
            if (player.User == null)
            {
                player.User = await _unitOfWork.UserRepository.GetByIdAsync(player.UserId);
            }
        }

        Match match = new Match
        {
            GameTableId = table.Id,
            GameTable = table,
            Players = table.Players,
            StartedAt = DateTime.UtcNow,
            MatchState = MatchState.InProgress
        };

        foreach (var player in match.Players)
        {
            player.GameMatch = match;
            player.GameMatchId = 0; // Si aún no guardamos en DB
        }

        return match;
    }

    public async Task<bool> EndMatchForPlayerAsync(Match match, int userId)
    {
        var player = match.Players.FirstOrDefault(p => p.UserId == userId);
        if (player == null) return false;

        if (player.User == null)
            player.User = await _unitOfWork.UserRepository.GetByIdAsync(userId);

        var history = await _unitOfWork.GameHistoryRepository.FindActiveSessionAsync(userId, match.GameTableId);
        if (history == null)
        {
            history = new History
            {
                UserId = userId,
                GameTableId = match.GameTableId,
                GameType = match.GameTable.GameType,
                JoinedAt = match.StartedAt,
                TotalMatchesPlayed = 1,
                TotalBetAmount = player.CurrentBet,
                ChipResult = 0
            };
            await _unitOfWork.GameHistoryRepository.InsertAsync(history);
        }
        else
        {
            history.TotalMatchesPlayed += 1;
            history.TotalBetAmount += player.CurrentBet;
        }

        match.Players.Remove(player);
        return true;
    }

    public async Task<bool> CancelMatchIfInsufficientPlayersAsync(Match match)
    {
        if (match.Players.Count >= match.GameTable.MinPlayer)
            return false;

        foreach (var player in match.Players)
        {
            if (player.User == null)
                player.User = await _unitOfWork.UserRepository.GetByIdAsync(player.UserId);

            player.User.Coins += player.CurrentBet;
            player.CurrentBet = 0;
        }

        match.GameTable.TableState = TableState.Waiting;
        _unitOfWork.GameTableRepository.Update(match.GameTable);
        await _unitOfWork.SaveAsync();

        return true;
    }
}