using the_enigma_casino_server.WS.Interfaces;

namespace the_enigma_casino_server.WS.PokerWS;

public class PokerSessionCleaner : IGameSessionCleaner
{
    public void Clean(int tableId)
    {
        ActivePokerGameStore.Remove(tableId);
    }
}
