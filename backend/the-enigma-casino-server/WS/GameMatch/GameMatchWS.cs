using System.Text.Json;
using the_enigma_casino_server.Games.Shared.Entities;
using the_enigma_casino_server.Games.Shared.Entities.Enum;
using the_enigma_casino_server.Models.Database;
using the_enigma_casino_server.WS.Base;
using the_enigma_casino_server.WS.GameTableWS.Store;
using the_enigma_casino_server.WS.Interfaces;
using the_enigma_casino_server.WS.Resolver;

namespace the_enigma_casino_server.WS.GameMatch;

public class GameMatchWS : BaseWebSocketHandler, IWebSocketMessageHandler
{
    public string Type => "gameMatch";

    private readonly GameMatchManager _matchManager;

    public GameMatchWS(ConnectionManagerWS connectionManager, IServiceProvider serviceProvider)
        : base(connectionManager, serviceProvider)
    {
        connectionManager.OnUserDisconnected += HandleUserDisconnection;

        using var scope = serviceProvider.CreateScope();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<UnitOfWork>();
        _matchManager = new GameMatchManager(unitOfWork);
    }

    public async Task HandleAsync(string userId, JsonElement message)
    {
        if (!message.TryGetProperty("action", out var actionProp))
            return;

        string action = actionProp.GetString();

        if (string.IsNullOrEmpty(action))
            return;

        switch (action)
        {
            case GameMatchMessageTypes.StartMatch:
                await HandleStartMatchAsync(userId, message);
                break;

            case GameMatchMessageTypes.LeaveMatch:
                await HandleLeaveMatchAsync(userId, message);
                break;
        }
    }

    private async Task HandleStartMatchAsync(string userId, JsonElement message)
    {
        if (!message.TryGetProperty("tableId", out var tableIdProp) ||
            !int.TryParse(tableIdProp.GetString(), out int tableId))
        {
            Console.WriteLine($"❌ start_match: tableId inválido.");
            return;
        }

        await StartMatchForTableAsync(tableId);
    }
    private async Task HandleLeaveMatchAsync(string userId, JsonElement message)
    {
        if (!int.TryParse(userId, out int userIdInt))
        {
            Console.WriteLine("❌ leave_match: userId inválido.");
            return;
        }

        if (!message.TryGetProperty("tableId", out var tableIdProp) ||
            !int.TryParse(tableIdProp.GetString(), out int tableId))
        {
            Console.WriteLine("❌ leave_match: tableId inválido.");
            return;
        }

        await EndMatchForPlayerAsync(tableId, userIdInt);
    }


    public async Task StartMatchForTableAsync(int tableId)
    {
        if (!ActiveGameSessionStore.TryGet(tableId, out var session))
        {
            Console.WriteLine($"❌ [GameMatchWS] No se encontró sesión activa para la mesa {tableId}");
            return;
        }

        Table table = session.Table;

        IServiceScope scope;
        UnitOfWork unitOfWork = GetScopedService<UnitOfWork>(out scope);
        using (scope)
        {
            GameMatchManager manager = new(unitOfWork);

            Match? match = await manager.StartMatchAsync(table);
            if (match == null)
                return;

            ActiveGameMatchStore.Set(table.Id, match);

            Console.WriteLine($"✅ [GameMatchWS] Partida iniciada en mesa {table.Id} con {match.Players.Count} jugadores.");

            var userIds = match.Players.Select(p => p.UserId.ToString()).ToArray();

            await BroadcastToUsersAsync(userIds, new
            {
                type = GameMatchMessageTypes.MatchStarted,
                tableId = table.Id,
                matchId = 0,
                players = table.Players.Select(p => p.User.NickName).ToArray(),
                startedAt = match.StartedAt
            });
        }
    }



    private async Task EndMatchForPlayerAsync(int tableId, int userId)
    {
        if (!ActiveGameMatchStore.TryGet(tableId, out var match))
        {
            Console.WriteLine($"❌ [GameMatchWS] No hay partida activa en la mesa {tableId}");
            return;
        }

        bool removed = await _matchManager.EndMatchForPlayerAsync(match, userId);
        if (!removed)
        {
            Console.WriteLine($"⚠️ [GameMatchWS] Jugador {userId} no encontrado en partida.");
            return;
        }

        Console.WriteLine($"👤 [GameMatchWS] Jugador {userId} ha terminado su partida en mesa {tableId}");

        await SendToUserAsync(userId.ToString(), new
        {
            type = GameMatchMessageTypes.MatchEnded,
            tableId,
            endedAt = DateTime.UtcNow
        });

        var otherUserIds = match.Players.Select(p => p.UserId.ToString()).ToArray();
        await BroadcastToUsersAsync(otherUserIds, new
        {
            type = GameMatchMessageTypes.PlayerLeftMatch,
            tableId,
            userId,
            // Aquí `player.User` ya no está disponible, así que no mostramos nick.
        });

        bool cancelled = await _matchManager.CancelMatchIfInsufficientPlayersAsync(match);
        if (cancelled)
        {
            ActiveGameMatchStore.Remove(tableId);

            await BroadcastToUsersAsync(otherUserIds, new
            {
                type = GameMatchMessageTypes.MatchCancelled,
                tableId,
                reason = "not_enough_players"
            });

            Console.WriteLine($"🧹 [GameMatchWS] Match eliminado por jugadores insuficientes en mesa {tableId}");
        }
    }




    private async void HandleUserDisconnection(string userId)
    {
        if (!int.TryParse(userId, out int userIdInt))
            return;

        foreach (var (tableId, match) in ActiveGameMatchStore.GetAll())
        {
            if (match.Players.Any(p => p.UserId == userIdInt))
            {
                await EndMatchForPlayerAsync(tableId, userIdInt);
                break;
            }
        }
    }


}