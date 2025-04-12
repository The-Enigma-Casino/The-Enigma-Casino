namespace the_enigma_casino_server.WS.Interfaces;

public interface IGameTurnService
{
    Task ForceAdvanceTurnAsync(int tableId, int userId);
}
