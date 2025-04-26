using the_enigma_casino_server.WebSockets.GameTable.Store;
using the_enigma_casino_server.WebSockets.GameTable;
using the_enigma_casino_server.WebSockets.GameMatch.Store;
using the_enigma_casino_server.WebSockets.GameMatch;

public class UserDisconnectionHandler
{
    private readonly IServiceProvider _serviceProvider;

    public UserDisconnectionHandler(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    public async Task HandleDisconnectionAsync(string userId)
    {
        if (!int.TryParse(userId, out int userIdInt))
            return;

        // Intentar desconectarlo del Match primero
        foreach (var (tableId, match) in ActiveGameMatchStore.GetAll())
        {
            if (match.Players.Any(p => p.UserId == userIdInt))
            {
                using var scope = _serviceProvider.CreateScope();
                var gameMatchWS = scope.ServiceProvider.GetRequiredService<GameMatchWS>();

                await gameMatchWS.ProcessPlayerMatchLeaveAsync(tableId, userIdInt);
                return; 
            }
        }

        // Si no está en ningún Match, intentar sacarlo de la mesa
        foreach (var session in ActiveGameSessionStore.GetAll().Values)
        {
            var table = session.Table;

            using var scope = _serviceProvider.CreateScope();
            var gameTableWS = scope.ServiceProvider.GetRequiredService<GameTableWS>();

            var result = gameTableWS.ForceRemovePlayerFromTable(userIdInt, session);
            if (result == null || !result.PlayerRemoved)
                continue;

            if (result.StopCountdown)
                await gameTableWS.BroadcastCountdownStoppedAsync(table.Id, result.ConnectedUsers);

            await gameTableWS.BroadcastTableUpdateAsync(table, result.ConnectedUsers, result.PlayerNames);
        }
    }
}