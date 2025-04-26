using the_enigma_casino_server.Games.Shared.Entities;

namespace the_enigma_casino_server.WebSockets.Interfaces;

public interface IGameExitRuleHandler
{
    Task<bool> HandlePlayerExitAsync(Player player, Match match);
}