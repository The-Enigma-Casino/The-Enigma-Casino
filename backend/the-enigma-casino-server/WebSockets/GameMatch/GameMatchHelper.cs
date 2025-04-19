using the_enigma_casino_server.Games.Shared.Entities;
using the_enigma_casino_server.Games.Shared.Enum;
using the_enigma_casino_server.WebSockets.BlackJack;
using the_enigma_casino_server.WebSockets.GameMatch.Store;
using the_enigma_casino_server.WebSockets.GameTable;

namespace the_enigma_casino_server.WebSockets.GameMatch;

public static class GameMatchHelper
{
    public static void LogMatchNotFound(int tableId)
    {
        Console.WriteLine($"❌ [GameMatchWS] No hay partida activa en la mesa {tableId}");
    }

    public static Player FindPlayer(Match match, int userId)
    {
        Player player = match.Players.FirstOrDefault(p => p.UserId == userId);
        if (player == null)
        {
            Console.WriteLine($"⚠️ [GameMatchWS] Jugador {userId} no encontrado en partida.");
        }
        return player;
    }

    public static async Task NotifyPlayerMatchEndedAsync(IWebSocketSender sender, int userId, int tableId)
    {
        await sender.SendToUserAsync(userId.ToString(), new
        {
            type = GameMatchMessageTypes.MatchEnded,
            tableId,
            endedAt = DateTime.Now
        });
    }

    public static async Task NotifyOthersPlayerLeftAsync(IWebSocketSender sender, Match match, int userId, int tableId)
    {
        var otherUserIds = match.Players.Select(p => p.UserId.ToString()).ToArray();
        await sender.BroadcastToUsersAsync(otherUserIds, new
        {
            type = GameMatchMessageTypes.PlayerLeftMatch,
            tableId,
            userId,
        });
    }

    public static async Task NotifyMatchCancelledAsync(IWebSocketSender sender, Match match, int tableId)
    {
        var remainingUserIds = match.Players.Select(p => p.UserId.ToString()).ToArray();
        await sender.BroadcastToUsersAsync(remainingUserIds, new
        {
            type = GameMatchMessageTypes.MatchCancelled,
            tableId,
            reason = "not_enough_players"
        });

        Console.WriteLine($"🧹 [GameMatchWS] Match eliminado por jugadores insuficientes en mesa {tableId}");
    }

    public static async Task<bool> TryCancelMatchAsync(IWebSocketSender sender, Match match, GameMatchManager manager, GameTableManager tableManager, int tableId)
    {
        bool cancelled = await manager.CancelMatchIfInsufficientPlayersAsync(match, tableManager);
        if (cancelled)
        {
            ActiveGameMatchStore.Remove(tableId);
            await NotifyMatchCancelledAsync(sender, match, tableId);
        }
        return cancelled;
    }

    public static async Task CheckGamePostExitLogicAsync(Match match, int tableId, IServiceProvider serviceProvider)
    {
        if (match.GameTable.GameType == GameType.BlackJack)
        {
            var blackjackWS = serviceProvider.GetRequiredService<BlackjackWS>();
            await blackjackWS.CheckAutoStartAfterPlayerLeft(tableId);
        }
    }

    public static async Task TryAutoDealIfAllPlayersBetAsync(int tableId, Match match, BlackjackWS blackjackWS)
    {
        if (match.GameTable.GameType != GameType.BlackJack)
            return;

        var expectedPlayerIds = match.Players.Select(p => p.UserId).ToList();


        if (BlackjackBetTracker.HaveAllPlayersBet(tableId, expectedPlayerIds))
        {
            BlackjackBetTracker.Clear(tableId);
            await blackjackWS.HandleDealInitialCardsAsync(tableId);
        }
    }
}