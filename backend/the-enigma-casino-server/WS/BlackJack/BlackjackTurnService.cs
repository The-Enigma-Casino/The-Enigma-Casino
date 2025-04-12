using the_enigma_casino_server.WS.BlackJackWS;
using the_enigma_casino_server.WS.Interfaces;

namespace the_enigma_casino_server.WS.BlackJack;

public class BlackjackTurnService : IGameTurnService
{
    private readonly BlackjackWebSocket _blackjackWS;

    public BlackjackTurnService(BlackjackWebSocket blackjackWS)
    {
        _blackjackWS = blackjackWS;
    }

    public async Task ForceAdvanceTurnAsync(int tableId, int userId)
    {
        await _blackjackWS.ForceAdvanceTurnAsync(tableId, userId);
    }
}