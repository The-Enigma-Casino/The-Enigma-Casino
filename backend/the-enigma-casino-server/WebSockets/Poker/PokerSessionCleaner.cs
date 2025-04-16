using the_enigma_casino_server.WebSockets.Interfaces;
using the_enigma_casino_server.WebSockets.Poker.Store;

namespace the_enigma_casino_server.WebSockets.Poker;

public class PokerSessionCleaner : IGameSessionCleaner
{
    public void Clean(int tableId)
    {
        ActivePokerGameStore.Remove(tableId);
    }
}
