using System.Net.WebSockets;
using System.Text;
using System.Text.Json;
using the_enigma_casino_server.Core.Entities;
using the_enigma_casino_server.Games.Shared.Entities;
using the_enigma_casino_server.Infrastructure.Database;
using the_enigma_casino_server.WebSockets.GameMatch.Store;

namespace the_enigma_casino_server.WebSockets.Base;

public abstract class BaseWebSocketHandler : WebSocketService, IWebSocketSender
{
    protected BaseWebSocketHandler(ConnectionManagerWS connectionManager, IServiceProvider serviceProvider)
        : base(connectionManager, serviceProvider)
    {
    }

    // 🔧 Utilidades de inyección de dependencias
    protected T GetScopedService<T>(out IServiceScope scope)
    {
        scope = _serviceProvider.CreateScope();
        return scope.ServiceProvider.GetRequiredService<T>();
    }

    // 📤 Envío de mensajes a un usuario
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

    // 📢 Broadcast a varios usuarios
    async Task IWebSocketSender.BroadcastToUsersAsync(IEnumerable<string> userIds, object payload)
    {
        foreach (string userId in userIds)
        {
            await ((IWebSocketSender)this).SendToUserAsync(userId, payload);
        }
    }

    // ❌ Enviar error
    public async Task SendErrorAsync(string userId, string errorMessage, string contextType)
    {
        var error = new
        {
            type = contextType,
            action = "error",
            message = errorMessage
        };

        await ((IWebSocketSender)this).SendToUserAsync(userId, error);
    }

    // 📥 Parseo de tableId desde mensaje
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

    // 🔁 Getters reutilizables con error
    public bool TryGetWithError<T>(
        Func<int, T?> getter,
        int tableId,
        out T result,
        string entityName,
        string? userId = null,
        string? contextType = null)
    {
        result = getter(tableId)!;

        if (result == null)
        {
            Console.WriteLine($"❌ No se encontró {entityName} para mesa {tableId}");
            if (userId != null)
                _ = SendErrorAsync(userId, $"No se encontró {entityName} en esta mesa.", contextType);
            return false;
        }

        return true;
    }

    protected bool TryGetWithError<T>(
        Func<T?> getter,
        out T result,
        string entityName,
        string? userId = null,
        string? contextType = null)
    {
        result = getter()!;

        if (result == null)
        {
            Console.WriteLine($"❌ No se encontró {entityName}");
            if (userId != null)
                _ = SendErrorAsync(userId, $"No se encontró {entityName}.", contextType);
            return false;
        }

        return true;
    }

    // 🎮 Obtener Match
    protected bool TryGetMatch(int tableId, string userId, out Match match)
        => TryGetWithError(ActiveGameMatchStore.TryGetNullable, tableId, out match, "match", userId);

    protected bool TryGetMatch(int tableId, out Match match)
        => TryGetWithError(ActiveGameMatchStore.TryGetNullable, tableId, out match, "match");

    // 🧑‍🤝‍🧑Obtener Player desde Match
    protected bool TryGetPlayer(Match match, string userId, out Player player)
        => TryGetWithError(
            () => TryGetPlayerFromMatch(match, userId),
            out player,
            "jugador",
            userId);

    private Player? TryGetPlayerFromMatch(Match match, string userId)
    {
        return match.Players.FirstOrDefault(p => p.UserId.ToString() == userId);
    }

    // Obtener Id
    protected async Task<User> GetUserById(int userId)
    {
        IServiceScope scope;
        var unitOfWork = GetScopedService<UnitOfWork>(out scope);

        using (scope)
        {
            var user = await unitOfWork.UserRepository.GetByIdAsync(userId);
            if (user == null)
                throw new KeyNotFoundException($"Usuario con ID {userId} no encontrado.");

            return user;
        }
    }

}