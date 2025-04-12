using the_enigma_casino_server.WS.BlackJackWS;
using the_enigma_casino_server.WS.Interfaces;

namespace the_enigma_casino_server.WS.BlackJack;

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