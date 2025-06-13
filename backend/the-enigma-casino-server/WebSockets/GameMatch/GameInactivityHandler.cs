using the_enigma_casino_server.Games.Shared.Entities;
using the_enigma_casino_server.Games.Shared.Enum;
using the_enigma_casino_server.Infrastructure.Database;
using the_enigma_casino_server.WebSockets.GameTable;
using the_enigma_casino_server.WebSockets.Resolvers;

namespace the_enigma_casino_server.WebSockets.Handlers;

public class GameInactivityHandler
{
    private readonly IServiceProvider _provider;
    private readonly GameInactivityTrackerResolver _trackerResolver;

    public GameInactivityHandler(IServiceProvider provider, GameInactivityTrackerResolver trackerResolver)
    {
        _provider = provider;
        _trackerResolver = trackerResolver;
    }

    public async Task HandleInactivityAsync(Table table)
    {
        var inactivityTracker = _trackerResolver.Resolve(table.GameType);
        if (inactivityTracker == null)
            return;

        foreach (var player in table.Players.ToList())
        {
            if (inactivityTracker.ShouldKickPlayer(player))
            {
                using var scope = _provider.CreateScope();
                var tableManager = scope.ServiceProvider.GetRequiredService<GameTableManager>();
                var unitOfWork = scope.ServiceProvider.GetRequiredService<UnitOfWork>();
                var sender = scope.ServiceProvider.GetRequiredService<IWebSocketSender>();

                player.PlayerState = PlayerState.Left;

                var history = await unitOfWork.GameHistoryRepository.FindActiveSessionAsync(player.UserId, table.Id);
                if (history != null && history.LeftAt == null)
                {
                    history.LeftAt = DateTime.UtcNow;
                    unitOfWork.GameHistoryRepository.Update(history);
                    await unitOfWork.SaveAsync();
                }

                tableManager.RemovePlayerFromTable(table, player.UserId, out _);

                await sender.SendToUserAsync(player.UserId.ToString(), new
                {
                    type = table.GameType.ToString().ToLower(),
                    action = "player_kicked",
                    message = "Has sido expulsado de la mesa por inactividad."
                });

                inactivityTracker.RemovePlayer(player);
            }
        }
    }
}