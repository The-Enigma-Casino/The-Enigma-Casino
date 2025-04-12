using the_enigma_casino_server.Games.Shared.Entities.Enum;
using the_enigma_casino_server.WS.BlackJackWS.Store;
using the_enigma_casino_server.WS.Interfaces;

namespace the_enigma_casino_server.WS.BlackJackWS;

public class BlackjackSessionCleaner : IGameSessionCleaner
{
    public void Clean(int tableId)
    {
        ActiveBlackjackGameStore.Remove(tableId);
    }
}