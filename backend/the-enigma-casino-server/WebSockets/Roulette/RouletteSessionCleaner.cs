using the_enigma_casino_server.WebSockets.Interfaces;
using the_enigma_casino_server.WebSockets.Roulette;

namespace the_enigma_casino_server.Websockets.Roulette;

public class RouletteSessionCleaner : IGameSessionCleaner
{
    public void Clean(int tableId)
    {
        ActiveRouletteGameStore.Remove(tableId);
    }
}
