using the_enigma_casino_server.WebSockets.GameMatch.Store;
using the_enigma_casino_server.WebSockets.GameMatch;
using the_enigma_casino_server.WebSockets.GameTable;
using the_enigma_casino_server.WebSockets.GameTable.Store;

namespace the_enigma_casino_server.Websockets.Base;

public class UserDisconnectionHandler
{
    private readonly GameTableWS _gameTableWS;

    public UserDisconnectionHandler(GameTableWS gameTableWS)
    {
        _gameTableWS = gameTableWS;
    }

    public async Task HandleDisconnectionAsync(string userId)
    {
        if (!int.TryParse(userId, out int userIdInt))
            return;

        foreach (var session in ActiveGameSessionStore.GetAll().Values)
        {
            var table = session.Table;
            var result = _gameTableWS.ForceRemovePlayerFromTable(userIdInt, session);

            if (result == null || !result.PlayerRemoved)
                continue;

            if (result.StopCountdown)
                await _gameTableWS.BroadcastCountdownStoppedAsync(table.Id, result.ConnectedUsers);

            await _gameTableWS.BroadcastTableUpdateAsync(table, result.ConnectedUsers, result.PlayerNames);
        }
    }
}