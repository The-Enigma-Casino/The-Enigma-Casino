using the_enigma_casino_server.Games.Shared.Entities;
using the_enigma_casino_server.WebSockets.Interfaces;

namespace the_enigma_casino_server.WebSockets.BlackJack;

public class BlackjackTurnService : IGameTurnService
{
    private readonly BlackjackWS _blackjackWS;

    public BlackjackTurnService(BlackjackWS blackjackWS)
    {
        _blackjackWS = blackjackWS;
    }

    public async Task ForceAdvanceTurnAsync(int tableId, int userId)
    {
        await _blackjackWS.ForceAdvanceTurnAsync(tableId, userId);
    }

    public async Task OnPlayerExitAsync(Player player, Match match)
    {
        // Si el jugador que sale tenía el turno → forzar avance
        if (match.GameTableId == 0) return;

        int tableId = match.GameTableId;
        int userId = player.UserId;

        await ForceAdvanceTurnAsync(tableId, userId);
    }

}