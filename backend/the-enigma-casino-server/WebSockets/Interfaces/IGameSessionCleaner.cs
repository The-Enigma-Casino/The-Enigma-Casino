namespace the_enigma_casino_server.WebSockets.Interfaces;

public interface IGameSessionCleaner
{
    void Clean(int tableId);
}