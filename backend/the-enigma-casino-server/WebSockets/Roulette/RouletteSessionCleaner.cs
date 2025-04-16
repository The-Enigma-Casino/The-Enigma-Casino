using the_enigma_casino_server.WebSockets.Interfaces;

namespace the_enigma_casino_server.Websockets.Roulette;

public class RouletteSessionCleaner : IGameSessionCleaner
{
    public void Clean(int tableId)
    {
        ActiveRouletteGameStore.Remove(tableId);
        Console.WriteLine($"Sesion de ruleta limpiada para mesa {tableId}");
    }
}
