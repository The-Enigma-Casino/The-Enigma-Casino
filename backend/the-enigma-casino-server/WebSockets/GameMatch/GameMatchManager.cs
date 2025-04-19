using the_enigma_casino_server.Games.Shared.Entities;
using the_enigma_casino_server.Games.Shared.Enum;
using the_enigma_casino_server.Infrastructure.Database;
using the_enigma_casino_server.WebSockets.GameMatch.Store;
using the_enigma_casino_server.WebSockets.GameTable;
using the_enigma_casino_server.WebSockets.GameTable.Store;
using the_enigma_casino_server.WebSockets.Interfaces;
using the_enigma_casino_server.WebSockets.Poker;
using the_enigma_casino_server.WebSockets.Resolvers;

namespace the_enigma_casino_server.WebSockets.GameMatch;

public class GameMatchManager
{
    private readonly UnitOfWork _unitOfWork;
    private readonly GameBetInfoProviderResolver _betInfoResolver;
    private readonly GameTurnServiceResolver _turnResolver;
    private readonly GameSessionCleanerResolver _sessionCleanerResolver;

    private readonly IServiceProvider _serviceProvider;

    public GameMatchManager(UnitOfWork unitOfWork,
                            GameBetInfoProviderResolver betInfoResolver,
                            GameTurnServiceResolver turnResolver,
                            GameSessionCleanerResolver sessionCleanerResolver,
                            IServiceProvider serviceProvider)
    {
        _unitOfWork = unitOfWork;
        _betInfoResolver = betInfoResolver;
        _turnResolver = turnResolver;
        _sessionCleanerResolver = sessionCleanerResolver;
        _serviceProvider = serviceProvider;
    }


    public async Task<Match> StartMatchAsync(Table table)
    {
        if (table.Players.Count < table.MinPlayer) return null;

        foreach (Player player in table.Players)
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
            StartedAt = DateTime.Now,
            MatchState = MatchState.InProgress
        };

        foreach (Player player in match.Players)
        {
            player.ResetForNewRound();
            _unitOfWork.UserRepository.Update(player.User);
        }

        await _unitOfWork.SaveAsync();



        foreach (Player player in match.Players)
        {
            player.GameMatch = match;
            player.GameMatchId = 0;
        }

        if (table.GameType == GameType.Poker)
        {
            PokerWS pokerWS = _serviceProvider.GetRequiredService<PokerWS>();
            await pokerWS.StartInitialDealAsync(match);
        }

        return match;
    }

    public async Task<bool> EndMatchForPlayerAsync(Match match, int userId)
    {
        Player player = match.Players.FirstOrDefault(p => p.UserId == userId);
        if (player == null) return false;

        bool matchPlayed = player.Hand?.Cards.Any() == true;
        await UpdateOrInsertHistoryAsync(player, match, playerLeftTable: true, matchPlayed);

        match.Players.Remove(player);
        return true;
    }


    public async Task<bool> CancelMatchIfInsufficientPlayersAsync(Match match, GameTableManager tableManager)
    {
        if (match.Players.Count >= match.GameTable.MinPlayer)
            return false;

        bool gameStarted = match.Players.Any(p => p.Hand != null && p.Hand.Cards.Count > 0);

        if (!gameStarted)
        {
            foreach (Player player in match.Players.ToList())
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

        return false;
    }

    public async Task EndMatchAsync(Match match)
    {
        match.EndedAt = DateTime.Now;
        match.MatchState = MatchState.Finished;

        foreach (Player player in match.Players)
        {
            if (player.PlayerState == PlayerState.Left)
            {
                continue;
            }

            await UpdateOrInsertHistoryAsync(player, match, playerLeftTable: false, matchPlayed: true);
        }

        ActiveGameMatchStore.Remove(match.GameTableId);

        IGameSessionCleaner cleaner = _sessionCleanerResolver.Resolve(match.GameTable.GameType);
        if (cleaner != null)
        {
            cleaner.Clean(match.GameTableId);
        }
    }


    public async Task RefundBetIfNotPlayedAsync(Player player, Match match)
    {
        bool gameStarted = match.Players.Any(p => p.Hand != null && p.Hand.Cards.Count > 0);

        if (!gameStarted && player.CurrentBet > 0)
        {
            player.User.Coins += player.CurrentBet;
            player.CurrentBet = 0;

            _unitOfWork.UserRepository.Update(player.User);
            await _unitOfWork.SaveAsync();
        }
    }

    public async Task<bool> HandlePlayerExitAsync(Player player, Match match, int tableId, IGameTurnService turnService)
    {
        bool gameStarted = match.Players.Any(p => p.Hand != null && p.Hand.Cards.Count > 0);

        if (!gameStarted && player.CurrentBet > 0)
        {
            // Jugador se va antes de que empiece la ronda: se le devuelve la apuesta
            int betAmount = player.CurrentBet;

            player.User.Coins += player.CurrentBet;
            player.CurrentBet = 0;

            _unitOfWork.UserRepository.Update(player.User);
            await _unitOfWork.SaveAsync();
        }
        else
        {
            // Jugador se va con la ronda ya empezada → derrota y se guarda historial
            if (player.PlayerState == PlayerState.Playing)
            {
                player.PlayerState = PlayerState.Lose;
            }

            await UpdateOrInsertHistoryAsync(player, match, playerLeftTable: true, matchPlayed: true);
        }

        player.PlayerState = PlayerState.Left;

        if (turnService != null)
        {
            await turnService.ForceAdvanceTurnAsync(tableId, player.UserId);
        }


        bool removed = await EndMatchForPlayerAsync(match, player.UserId);

        if (!removed) return false;

        return true;
    }

    private async Task UpdateOrInsertHistoryAsync(Player player, Match match, bool playerLeftTable, bool matchPlayed)
    {
        if (player.User == null)
        {
            player.User = await _unitOfWork.UserRepository.GetByIdAsync(player.UserId);
        }

        if (player.PlayerState == PlayerState.Left) return;

        IGameBetInfoProvider provider = _betInfoResolver.Resolve(match.GameTable.GameType);

        // Obtener los datos específicos del juego
        int chips = matchPlayed ? provider.GetChipResult(player) : 0;
        int totalBet = matchPlayed ? provider.GetLastBetAmount(match.GameTableId, player.UserId) : 0;

        bool hasPlayed = matchPlayed && player.Hand != null && player.Hand.Cards.Count > 0;
        bool hasBet = matchPlayed && totalBet > 0;

        History history = await _unitOfWork.GameHistoryRepository.FindActiveSessionAsync(player.UserId, match.GameTableId);

        int matchCount = matchPlayed ? provider.GetMatchCountForHistory(player) : 0;


        if (history == null)
        {
            if (!hasPlayed) return;

            history = new History
            {
                UserId = player.UserId,
                GameTableId = match.GameTableId,
                GameType = match.GameTable.GameType,
                JoinedAt = player.JoinedAt ?? DateTime.Now,
                TotalMatchesPlayed = matchCount,
                TotalBetAmount = totalBet,
                ChipResult = chips,
                LeftAt = playerLeftTable ? DateTime.Now : null
            };

            await _unitOfWork.GameHistoryRepository.InsertAsync(history);
            await _unitOfWork.SaveAsync();
            return;
        }

        // Ya existe historial → acumular datos si jugó
        if (matchPlayed && hasBet)
        {
            history.TotalMatchesPlayed += matchCount;
            history.TotalBetAmount += totalBet;
            history.ChipResult += chips;
        }

        // Si se va de la mesa → cerrar historial
        if (playerLeftTable)
        {
            history.LeftAt = DateTime.Now;
            player.PlayerState = PlayerState.Left;
        }

        _unitOfWork.GameHistoryRepository.Update(history);
        await _unitOfWork.SaveAsync();
    }
}