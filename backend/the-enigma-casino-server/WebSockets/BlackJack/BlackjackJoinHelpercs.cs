using the_enigma_casino_server.Games.Shared.Entities;
using the_enigma_casino_server.Games.Shared.Enum;
using the_enigma_casino_server.WebSockets.GameMatch.Store;
using the_enigma_casino_server.WebSockets.Interfaces;

public class BlackjackJoinHelper : IGameJoinHelper
{
    public GameType ForGameType => GameType.BlackJack;

    public bool ShouldSendMatchReady(Player player, Match match)
    {
        return player.PlayerState == PlayerState.Spectating
               && !match.Players.Any(p => p.CurrentBet > 0);
    }

    public async Task NotifyPlayerCanJoinCurrentMatchIfPossible(int userId, Table table, IWebSocketSender sender)
    {
        if (!ActiveGameMatchStore.TryGet(table.Id, out var match))
            return;

        Player player = match.Players.FirstOrDefault(p => p.UserId == userId);
        if (player == null)
            return;

        if (ShouldSendMatchReady(player, match))
        {
            player.PlayerState = PlayerState.Playing;
            player.GameMatch = match;

            await sender.SendToUserAsync(userId.ToString(), new
            {
                type = "blackjack",
                action = "match_ready",
                message = "¡Has llegado a tiempo! Puedes jugar esta ronda de Blackjack."
            });

            Console.WriteLine($"📩 [BlackjackJoinHelper] Jugador {player.User.NickName} notificado y marcado como 'Playing'.");
        }
    }

    public Task NotifyPlayerJoinedNextMatch(int userId, IWebSocketSender sender)
    {
        return sender.SendToUserAsync(userId.ToString(), new
        {
            type = "blackjack",
            action = "match_ready",
            message = "¡Bienvenido! Esta vez sí estás dentro de la partida. Prepárate para apostar 🎲"
        });
    }

}