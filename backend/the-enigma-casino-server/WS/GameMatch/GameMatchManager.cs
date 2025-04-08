using the_enigma_casino_server.Games.Shared.Entities;
using the_enigma_casino_server.Games.Shared.Entities.Enum;
using the_enigma_casino_server.Models.Database;
using the_enigma_casino_server.WS.BlackJackWS.Store;
using the_enigma_casino_server.WS.GameTableWS.Store;
using the_enigma_casino_server.WS.GameWS.Services;

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

        await UpdateOrInsertHistoryAsync(player, match, playerLeftTable: true);

        match.Players.Remove(player);
        BlackjackBetTracker.RemovePlayer(match.GameTableId, player.UserId);
        return true;
    }


    public async Task<bool> CancelMatchIfInsufficientPlayersAsync(Match match, GameTableManager tableManager)
    {
        if (match.Players.Count >= match.GameTable.MinPlayer)
            return false;

        bool gameStarted = match.Players.Any(p => p.Hand != null && p.Hand.Cards.Count > 0);

        if (!gameStarted)
        {
            Console.WriteLine("⛔ [GameMatchManager] Match cancelado antes de comenzar. Devolviendo fichas...");

            foreach (var player in match.Players.ToList())
            {
                player.User ??= await _unitOfWork.UserRepository.GetByIdAsync(player.UserId);

                await RefundBetIfNotPlayedAsync(player, match);

                tableManager.RemovePlayerFromTable(match.GameTable, player.UserId, out _);
            }


            match.GameTable.TableState = TableState.Waiting;

            if (ActiveGameSessionStore.TryGet(match.GameTableId, out var session))
                session.Table.TableState = TableState.Waiting;

            _unitOfWork.GameTableRepository.Update(match.GameTable);
            await _unitOfWork.SaveAsync();

            return true;
        }

        Console.WriteLine("🟡 [GameMatchManager] El match ya había empezado. No se cancela automáticamente.");
        return false;
    }



    public async Task EndMatchAsync(Match match)
    {
        match.EndedAt = DateTime.UtcNow;
        match.MatchState = MatchState.Finished;

        foreach (var player in match.Players)
        {
            await UpdateOrInsertHistoryAsync(player, match, playerLeftTable: false);
        }

        ActiveGameMatchStore.Remove(match.GameTableId);
        ActiveBlackjackGameStore.Remove(match.GameTableId);

        Console.WriteLine($"✅ [GameMatchManager] Match {match.GameTableId} finalizado y resultados guardados.");
    }

    private async Task UpdateOrInsertHistoryAsync(Player player, Match match, bool playerLeftTable)
    {
        if (player.User == null)
            player.User = await _unitOfWork.UserRepository.GetByIdAsync(player.UserId);

        var history = await _unitOfWork.GameHistoryRepository.FindActiveSessionAsync(
            player.UserId, match.GameTableId);

        int matchCount = GetMatchCountForGameType(match.GameTable.GameType);
        int chips = GetChipResult(player);
        bool hasBet = player.CurrentBet > 0;

        if (history == null)
        {
            if (!hasBet)
            {
                Console.WriteLine($"ℹ️ [History] Jugador {player.UserId} no apostó ni tiene historial previo. No se guarda nada.");
                return;
            }

            history = new History
            {
                UserId = player.UserId,
                GameTableId = match.GameTableId,
                GameType = match.GameTable.GameType,
                JoinedAt = player.JoinedAt ?? DateTime.UtcNow,
                TotalMatchesPlayed = matchCount,
                TotalBetAmount = player.CurrentBet,
                ChipResult = chips,
                LeftAt = null // ⬅️ Se mantiene abierto hasta que se vaya de la mesa
            };

            await _unitOfWork.GameHistoryRepository.InsertAsync(history);
        }
        else
        {
            history.TotalMatchesPlayed += matchCount;
            history.TotalBetAmount += player.CurrentBet;
            history.ChipResult += chips;


            if (playerLeftTable)
            {
                history.LeftAt = DateTime.UtcNow;
            }

            _unitOfWork.GameHistoryRepository.Update(history);
        }

        await _unitOfWork.SaveAsync();
    }

    private static int GetMatchCountForGameType(GameType gameType)
    {
        return gameType switch
        {
            GameType.BlackJack => 1,
            GameType.Roulette => 1,
            GameType.Poker => 0,
            _ => 1
        };
    }

    private static int GetChipResult(Player player)
    {
        return player.PlayerState switch
        {
            PlayerState.Win => player.CurrentBet * 2,
            PlayerState.Draw => player.CurrentBet,
            PlayerState.Lose => 0,
            PlayerState.Bust => 0,
            _ => 0
        };
    }

    public async Task RefundBetIfNotPlayedAsync(Player player, Match match)
    {
        bool gameStarted = match.Players.Any(p => p.Hand != null && p.Hand.Cards.Count > 0);

        if (!gameStarted && player.CurrentBet > 0)
        {
            Console.WriteLine($"💸 [Refund] Devolviendo {player.CurrentBet} monedas a {player.User.NickName} (no se jugó la ronda)");

            player.User.Coins += player.CurrentBet;
            player.CurrentBet = 0;

            _unitOfWork.UserRepository.Update(player.User);
            await _unitOfWork.SaveAsync();
        }
    }


}