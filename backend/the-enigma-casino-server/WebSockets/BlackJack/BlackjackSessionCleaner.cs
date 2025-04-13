using the_enigma_casino_server.Games.Shared.Enum;
using the_enigma_casino_server.WebSockets.Interfaces;

namespace the_enigma_casino_server.WebSockets.BlackJack;

public class BlackjackSessionCleaner : IGameSessionCleaner
{
    public void Clean(int tableId)
    {
        ActiveBlackjackGameStore.Remove(tableId);
    }
}