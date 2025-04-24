using the_enigma_casino_server.Games.Shared.Enum;
using the_enigma_casino_server.Games.Shared.Entities;

namespace the_enigma_casino_server.WebSockets.Interfaces
{
    public interface IGameJoinHelper
    {
        GameType ForGameType { get; }

        bool ShouldSendMatchReady(Player player, Match match);
        Task NotifyPlayerCanJoinCurrentMatchIfPossible(int userId, Table table, IWebSocketSender sender);
        Task NotifyPlayerJoinedNextMatch(int userId, IWebSocketSender sender); 
    }
}