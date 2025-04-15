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
}