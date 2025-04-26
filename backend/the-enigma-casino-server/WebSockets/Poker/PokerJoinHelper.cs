using the_enigma_casino_server.Games.Shared.Entities;
using the_enigma_casino_server.Games.Shared.Enum;
using the_enigma_casino_server.WebSockets.Interfaces;

namespace the_enigma_casino_server.WebSockets.Poker;

public class PokerJoinHelper : IGameJoinHelper
{
    public GameType ForGameType => GameType.Poker;

    public bool ShouldSendMatchReady(Player player, Match match)
    {
        return player.PlayerState == PlayerState.Spectating
               && match.Players.All(p => p.Hand == null || p.Hand.Cards.Count == 0);
    }

    public async Task NotifyPlayerCanJoinCurrentMatchIfPossible(int userId, Table table, IWebSocketSender sender)
    {
        Match? match = table.Players.FirstOrDefault(p => p.UserId == userId)?.GameMatch;
        Player? player = table.Players.FirstOrDefault(p => p.UserId == userId);

        if (match == null || player == null) return;

        if (ShouldSendMatchReady(player, match))
        {
            player.PlayerState = PlayerState.Playing;

            await sender.SendToUserAsync(userId.ToString(), new
            {
                type = "poker",
                action = "match_ready",
                message = "¡La siguiente ronda de Poker comienza y estás dentro! Prepárate para jugar."
            });

            Console.WriteLine($"📩 [PokerJoinHelper] Jugador {player.User.NickName} notificado y marcado como 'Playing'.");
        }
    }

    public Task NotifyPlayerJoinedNextMatch(int userId, IWebSocketSender sender)
    {
        // En Poker aún no se envía nada en este punto
        return Task.CompletedTask;
    }

    public void ResetPlayerStateForMatch(Player player)
    {
        player.PlayerState = PlayerState.Playing;
    }

}