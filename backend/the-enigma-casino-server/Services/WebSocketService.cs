using System.Net.WebSockets;
using System.Text;
using System.Text.Json;
using the_enigma_casino_server.WS;
using the_enigma_casino_server.WS.GameWS;

namespace the_enigma_casino_server.Services
{
    public class WebSocketService
    {
        protected readonly ConnectionManagerWS _connectionManager;

        protected readonly IServiceProvider _serviceProvider;

        public WebSocketService(ConnectionManagerWS connectionManager, IServiceProvider serviceProvider)
        {
            _connectionManager = connectionManager;
            _serviceProvider = serviceProvider;
        }

        // Método principal para manejar la conexión WebSocket
        public virtual async Task HandleAsync(WebSocket webSocket, string userId)
        {
            _connectionManager.AddConnection(userId, webSocket);
            await BroadcastOnlineUsersAsync();

            try
            {
                while (webSocket.State == WebSocketState.Open)
                {
                    string message = await ReadAsync(webSocket);

                    if (!string.IsNullOrWhiteSpace(message))
                    {
                        var messageData = JsonDocument.Parse(message).RootElement;

                        var gameTableHandler = _serviceProvider.GetRequiredService<GameTableWS>();
                        await gameTableHandler.HandleAsync(userId, messageData);
                    }
                }
            }
            finally
            {
                _connectionManager.RemoveConnection(userId);
                await BroadcastOnlineUsersAsync();

                if (webSocket.State == WebSocketState.Open)
                {
                    await webSocket.CloseAsync(WebSocketCloseStatus.NormalClosure, "Cerrado por el servidor", CancellationToken.None);
                }
            }
        }

        // Método para leer los mensajes del WebSocket
        protected virtual async Task<string> ReadAsync(WebSocket webSocket, CancellationToken cancellation = default)
        {
            byte[] buffer = new byte[4096];
            StringBuilder stringBuilder = new StringBuilder();

            bool endOfMessage = false;

            do
            {
                WebSocketReceiveResult result = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), cancellation);

                string partialMessage = Encoding.UTF8.GetString(buffer, 0, result.Count);
                stringBuilder.Append(partialMessage);

                if (result.CloseStatus.HasValue)
                {
                    await webSocket.CloseAsync(result.CloseStatus.Value, result.CloseStatusDescription, cancellation);
                }

                endOfMessage = result.EndOfMessage;
            }
            while (!endOfMessage);

            return stringBuilder.ToString();
        }

        // Método para enviar mensajes a un WebSocket
        protected async Task SendAsync(WebSocket socket, object payload)
        {
            string json = JsonSerializer.Serialize(payload);
            var buffer = Encoding.UTF8.GetBytes(json);
            await socket.SendAsync(
                new ArraySegment<byte>(buffer),
                WebSocketMessageType.Text,
                true,
                CancellationToken.None
            );
        }

        // Devuelve usuarios en linea
        public async Task BroadcastOnlineUsersAsync()
        {
            var connections = _connectionManager.GetAllConnections();
            int onlineUsers = connections.Count();

            var message = new
            {
                type = "onlineUsers",
                count = onlineUsers
            };

            string jsonMessage = JsonSerializer.Serialize(message);
            byte[] buffer = Encoding.UTF8.GetBytes(jsonMessage);

            foreach (var socket in connections)
            {
                if (socket.State == WebSocketState.Open)
                {
                    await socket.SendAsync(new ArraySegment<byte>(buffer), WebSocketMessageType.Text, true, CancellationToken.None);
                }
            }
        }
    }
}
