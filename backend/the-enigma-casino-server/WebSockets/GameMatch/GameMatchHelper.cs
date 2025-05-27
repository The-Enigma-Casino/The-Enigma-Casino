using the_enigma_casino_server.Games.Shared.Entities;
using the_enigma_casino_server.Games.Shared.Enum;
using the_enigma_casino_server.WebSockets.BlackJack;
using the_enigma_casino_server.WebSockets.GameMatch.Store;
using the_enigma_casino_server.WebSockets.GameTable;
using the_enigma_casino_server.WebSockets.GameTable.Store;
using the_enigma_casino_server.WebSockets.Poker.Store;

namespace the_enigma_casino_server.WebSockets.GameMatch;

public static class GameMatchHelper
{
    public const string Type = "game_match";

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
            type = Type,
            action = GameMatchMessageTypes.MatchEnded,
            message = "Match finalizado.",
            tableId,
            endedAt = DateTime.Now
        });
    }

    public static async Task NotifyOthersPlayerLeftAsync(
        IWebSocketSender sender,
        Match match,
        int userId,
        string nickname,
        int tableId)
    {
        if (!ActiveGameSessionStore.TryGet(tableId, out var session))
        {
            Console.WriteLine($"⚠️ [NotifyOthersPlayerLeftAsync] No se encontró sesión activa para la mesa {tableId}");
            return;
        }

        var allConnected = session.GetConnectedUserIds();
        var otherUserIds = allConnected.Where(id => id != userId.ToString()).ToArray();

        if (otherUserIds.Length == 0)
        {
            Console.WriteLine($"⚠️ [NotifyOthersPlayerLeftAsync] No hay jugadores conectados a los que enviar el mensaje.");
            return;
        }

        Console.WriteLine($"📢 Enviando 'player_left_match' a: {string.Join(", ", otherUserIds)}");

        await sender.BroadcastToUsersAsync(otherUserIds, new
        {
            type = Type,
            action = GameMatchMessageTypes.PlayerLeftMatch,
            tableId,
            userId,
            message = $"{nickname} ha abandonado la partida."
        });
    }




    public static async Task NotifyMatchCancelledAsync(IWebSocketSender sender, Match match, int tableId)
    {
        var remainingUserIds = match.Players.Select(p => p.UserId.ToString()).ToArray();
        await sender.BroadcastToUsersAsync(remainingUserIds, new
        {
            type = Type,
            action = GameMatchMessageTypes.MatchCancelled,
            tableId,
            message ="Partida eliminada por jugadores insuficientes en mesa.",
            reason = "not_enough_players"
        });

        Console.WriteLine($"🧹 [GameMatchWS] Match eliminado por jugadores insuficientes en mesa {tableId}");
    }

    public static async Task<bool> TryCancelMatchAsync(IWebSocketSender sender, Match match, GameMatchManager manager, GameTableManager tableManager, int tableId)
    {
        if (match.MatchState == MatchState.Finished)
        {
            Console.WriteLine($"⛔ [TryCancelMatch] Match en mesa {tableId} ya estaba finalizado. No se cancela de nuevo.");
            return false;
        }

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
        Console.WriteLine($"[DEBUG] Estado actual del Match en evento para mesa {tableId}: {match.MatchState}");

        if (match.MatchState != MatchState.InProgress)
        {
            Console.WriteLine($"[DEBUG] Ignorando CheckGamePostExitLogic para la mesa {tableId} porque el Match ya terminó ({match.MatchState}).");
            return;
        }

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