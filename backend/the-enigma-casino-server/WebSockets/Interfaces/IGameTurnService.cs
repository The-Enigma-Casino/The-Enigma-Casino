using the_enigma_casino_server.Games.Shared.Entities;

namespace the_enigma_casino_server.WebSockets.Interfaces;

public interface IGameTurnService
{
    Task ForceAdvanceTurnAsync(int tableId, int userId);
    Task OnPlayerExitAsync(Player player, Match match);

}
