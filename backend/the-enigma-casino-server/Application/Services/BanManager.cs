using System.Net.WebSockets;
using System.Threading;
using System.Threading.Tasks;
using the_enigma_casino_server.WebSockets.Base;
using the_enigma_casino_server.WebSockets.Interfaces;

namespace the_enigma_casino_server.Application.Services;

public class BanManager
{
    private readonly ConnectionManagerWS _connectionManager;
    private readonly IWebSocketSender _sender;

    public BanManager(ConnectionManagerWS connectionManager, IWebSocketSender sender)
    {
        _connectionManager = connectionManager;
        _sender = sender;
    }

    public async Task ForceDisconnectIfConnected(int userId)
    {
        string userIdStr = userId.ToString();

        if (_connectionManager.TryGetConnection(userIdStr, out WebSocket? ws))
        {
            var payload = new
            {
                type = "system",
                action = "banned",
                reason = "Has solicitado autobanearte. Tu sesión se cerrará ahora."
            };

            await _sender.SendToUserAsync(userIdStr, payload);

            await Task.Delay(300);

            try
            {
                await ws.CloseAsync(WebSocketCloseStatus.PolicyViolation, "Banned", CancellationToken.None);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[BanManager] Error cerrando WebSocket: {ex.Message}");
            }
        }
    }
}