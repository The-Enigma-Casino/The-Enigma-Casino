using System.Net.WebSockets;
using System.Text;
using System.Text.Json;
using the_enigma_casino_server.Games.Shared.Entities;
using the_enigma_casino_server.WebSockets.GameMatch.Store;

namespace the_enigma_casino_server.WebSockets.Base;

public abstract class BaseWebSocketHandler : WebSocketService, IWebSocketSender
{
    protected BaseWebSocketHandler(ConnectionManagerWS connectionManager, IServiceProvider serviceProvider)
        : base(connectionManager, serviceProvider)
    {
    }

    protected T GetScopedService<T>(out IServiceScope scope)
    {
        scope = _serviceProvider.CreateScope();
        return scope.ServiceProvider.GetRequiredService<T>();
    }

    async Task IWebSocketSender.SendToUserAsync(string userId, object payload)
    {
        WebSocket? socket = _connectionManager.GetConnectionById(userId);

        if (socket == null || socket.State != WebSocketState.Open)
        {
            Console.WriteLine($"[WS] 🔌 WebSocket de {userId} no está abierto (estado: {socket?.State}), eliminando conexión...");
            await _connectionManager.RemoveConnectionAsync(userId);
            return;
        }

        try
        {
            string json = JsonSerializer.Serialize(payload);
            byte[] buffer = Encoding.UTF8.GetBytes(json);

            await socket.SendAsync(
                new ArraySegment<byte>(buffer),
                WebSocketMessageType.Text,
                endOfMessage: true,
                cancellationToken: CancellationToken.None
            );
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[WS] ⚠️ Error enviando a {userId}: {ex.Message} — eliminando conexión");
            await _connectionManager.RemoveConnectionAsync(userId);
        }
    }

    public async Task SendErrorAsync(string userId, string errorMessage)
    {
        var error = new
        {
            type = "error",
            message = errorMessage
        };

        await ((IWebSocketSender)this).SendToUserAsync(userId, error);
    }

    async Task IWebSocketSender.BroadcastToUsersAsync(IEnumerable<string> userIds, object payload)
    {
        foreach (string userId in userIds)
        {
            await ((IWebSocketSender)this).SendToUserAsync(userId, payload);
        }
    }

    protected bool TryGetTableId(JsonElement message, out int tableId)
    {
        tableId = 0;
        if (!message.TryGetProperty("tableId", out var tableIdProp) ||
            !int.TryParse(tableIdProp.GetString(), out tableId))
        {
            Console.WriteLine("❌ [WebSocket] TableId inválido.");
            return false;
        }
        return true;
    }

    protected bool TryGetMatch(int tableId, string userId, out Match match)
    {
        if (!ActiveGameMatchStore.TryGet(tableId, out match))
        {
            Console.WriteLine($"❌ [WebSocket] No se encontró Match en la mesa {tableId}");
            _ = SendErrorAsync(userId, "No hay un match activo en esta mesa.");
            return false;
        }
        return true;
    }

    protected bool TryGetPlayer(Match match, string userId, out Player player)
    {
        player = match.Players.FirstOrDefault(p => p.UserId.ToString() == userId);
        if (player == null)
        {
            Console.WriteLine($"❌ [WebSocket] Jugador {userId} no encontrado en Match.");
            _ = SendErrorAsync(userId, "Jugador no encontrado en la mesa.");
            return false;
        }
        return true;
    }


}
