using the_enigma_casino_server.Games.Shared.Entities;
using the_enigma_casino_server.Games.Shared.Enum;
using the_enigma_casino_server.Infrastructure.Database;
using the_enigma_casino_server.WebSockets.GameMatch.Store;
using the_enigma_casino_server.WebSockets.GameTable;
using the_enigma_casino_server.WebSockets.GameTable.Store;
using the_enigma_casino_server.WebSockets.Interfaces;
using the_enigma_casino_server.WebSockets.Poker;
using the_enigma_casino_server.WebSockets.Resolvers;
using the_enigma_casino_server.WebSockets.Resolversl;

namespace the_enigma_casino_server.WebSockets.GameMatch;

public class GameMatchManager
{
    private readonly UnitOfWork _unitOfWork;
    private readonly GameBetInfoProviderResolver _betInfoResolver;
    private readonly GameTurnServiceResolver _turnResolver;
    private readonly GameSessionCleanerResolver _sessionCleanerResolver;
    private readonly GameExitRuleResolver _exitRuleResolver;

    private readonly IServiceProvider _serviceProvider;

    public GameMatchManager(UnitOfWork unitOfWork,
                            GameBetInfoProviderResolver betInfoResolver,
                            GameTurnServiceResolver turnResolver,
                            GameSessionCleanerResolver sessionCleanerResolver,
                            GameExitRuleResolver exitRuleResolver,
                            IServiceProvider serviceProvider)
    {
        _unitOfWork = unitOfWork;
        _betInfoResolver = betInfoResolver;
        _turnResolver = turnResolver;
        _sessionCleanerResolver = sessionCleanerResolver;
        _serviceProvider = serviceProvider;
        _exitRuleResolver = exitRuleResolver;
    }


    public async Task<Match> StartMatchAsync(Table table)
    {
        if (table.Players.Count < table.MinPlayer) return null;

        if (table.TableState != TableState.Waiting && table.TableState != TableState.Starting)
        {
            Console.WriteLine($"❌ [GameMatchManager] El estado de la mesa {table.Id} es inválido para iniciar partida: {table.TableState}");
            return null;
        }

        table.TableState = TableState.InProgress;
        _unitOfWork.GameTableRepository.Update(table);
        await _unitOfWork.SaveAsync();

        foreach (Player player in table.Players)
        {
            if (player.User == null)
            {
                player.User = await _unitOfWork.UserRepository.GetByIdAsync(player.UserId);
            }

            player.ResetForNewRound();
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
            player.GameMatch = match;
        }

        ActiveGameMatchStore.Set(table.Id, match);

        switch (table.GameType)
        {
            case GameType.Poker:
                var pokerWS = _serviceProvider.GetRequiredService<PokerWS>();
                await pokerWS.StartInitialDealAsync(match);
                break;

            default:
                Console.WriteLine($"ℹ️ [GameMatchManager] El juego {table.GameType} no requiere inicialización inmediata.");
                break;
        }

        return match;
    }

    public async Task EndMatchAsync(Match match)
    {
        match.EndedAt = DateTime.Now;
        match.MatchState = MatchState.Finished;

        foreach (Player player in match.Players)
        {
            await UpdateOrInsertHistoryAsync(player, match, playerLeftTable: false, matchPlayed: true);
        }

        await _unitOfWork.SaveAsync();

        ActiveGameMatchStore.Remove(match.GameTableId);

        IGameSessionCleaner cleaner = _sessionCleanerResolver.Resolve(match.GameTable.GameType);
        if (cleaner != null)
        {
            cleaner.Clean(match.GameTableId);
        }
    }

    public bool RemovePlayerFromMatch(Match match, int userId)
    {
        Player player = match.Players.FirstOrDefault(p => p.UserId == userId);
        if (player == null) return false;

        bool matchPlayed = player.Hand?.Cards.Any() == true;

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
        IGameExitRuleHandler handler = _exitRuleResolver.Resolve(match.GameTable.GameType);
        bool handled = await handler.HandlePlayerExitAsync(player, match);

        if (!handled) return false;

        if (turnService != null)
        {
            await turnService.OnPlayerExitAsync(player, match);
        }

        match.Players.Remove(player);
        return true;
    }


    private async Task UpdateOrInsertHistoryAsync(Player player, Match match, bool playerLeftTable, bool matchPlayed)
    {
        if (player.User == null)
        {
            player.User = await _unitOfWork.UserRepository.GetByIdAsync(player.UserId);
        }

        IGameBetInfoProvider provider = _betInfoResolver.Resolve(match.GameTable.GameType);
        int chips = matchPlayed ? provider.GetChipResult(player) : 0;
        int totalBet = matchPlayed ? provider.GetLastBetAmount(match.GameTableId, player.UserId) : 0;

        bool hasPlayed = matchPlayed && provider.HasPlayedThisMatch(player, match);
        bool hasBet = matchPlayed && totalBet > 0;

        History history = await _unitOfWork.GameHistoryRepository.FindActiveSessionAsync(player.UserId, match.GameTableId);

        int matchesPlayed = matchPlayed ? provider.GetMatchCountForHistory(player) : 0;


        if (history == null)
        {
            if (!hasPlayed) return;

            history = new History
            {
                UserId = player.UserId,
                GameTableId = match.GameTableId,
                GameType = match.GameTable.GameType,
                JoinedAt = player.JoinedAt ?? DateTime.Now,
                TotalMatchesPlayed = matchesPlayed,
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
            history.TotalMatchesPlayed += matchesPlayed;
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