using the_enigma_casino_server.Games.Shared.Entities;
using the_enigma_casino_server.Games.Shared.Enum;
using the_enigma_casino_server.WebSockets.Interfaces;

namespace the_enigma_casino_server.WebSockets.Roulette;

public class RouletteJoinHelper : IGameJoinHelper
{
    public GameType ForGameType => GameType.Roulette;
    public bool ShouldSendMatchReady(Player player, Match match)
    {
        return player.PlayerState == PlayerState.Spectating;
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
                type = "roulette",
                action = "match_ready",
                message = "¡La ruleta está girando! Puedes empezar a apostar."
            });

            Console.WriteLine($"📩 [RouletteJoinHelper] Jugador {player.User.NickName} notificado y marcado como 'Playing'.");
        }
    }
    public async Task NotifyPlayerJoinedNextMatch(int userId, IWebSocketSender sender)
    {
        await sender.SendToUserAsync(userId.ToString(), new
        {
            type = "roulette",
            action = "match_ready",
            message = "¡Bienvenido! Estás dentro de esta ronda de ruleta. Haz tus apuestas 🎰"
        });
    }

    public void ResetPlayerStateForMatch(Player player)
    {
        player.PlayerState = PlayerState.Playing;
    }
}
