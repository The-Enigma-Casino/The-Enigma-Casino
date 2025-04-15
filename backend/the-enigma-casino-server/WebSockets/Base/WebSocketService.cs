using System.Net.WebSockets;
using System.Text;
using System.Text.Json;
using the_enigma_casino_server.WebSockets.Interfaces;
using the_enigma_casino_server.WebSockets.Resolvers;

namespace the_enigma_casino_server.WebSockets.Base
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

        public virtual async Task HandleAsync(WebSocket webSocket, string userId)
        {
            _connectionManager.AddConnection(userId, webSocket);
            await BroadcastOnlineUsersAsync();

            try
            {
                while (webSocket.State == WebSocketState.Open)
                {
                    string rawMessage = await ReadAsync(webSocket);
                    if (string.IsNullOrWhiteSpace(rawMessage))
                        break;

                    JsonDocument document = null;

                    try
                    {
                        document = JsonDocument.Parse(rawMessage);
                    }
                    catch (JsonException ex)
                    {
                        Console.WriteLine($"❌ JSON inválido recibido: {ex.Message}");
                        continue;
                    }

                    var messageData = document.RootElement;
                    var handler = ResolveHandler(messageData);

                    if (handler != null)
                    {
                        await handler.HandleAsync(userId, messageData);
                    }
                }
            }
            finally
            {
                await _connectionManager.RemoveConnectionAsync(userId);
                await BroadcastOnlineUsersAsync();
            }
        }

        private IWebSocketMessageHandler ResolveHandler(JsonElement messageData)
        {
            if (!messageData.TryGetProperty("type", out var typeProp))
            {
                Console.WriteLine("El mensaje recibido no contiene la propiedad 'type'");
                return null;
            }

            var type = typeProp.GetString();
            if (string.IsNullOrWhiteSpace(type))
            {
                Console.WriteLine("La propiedad 'type' está vacía o es nula");
                return null;
            }

            var resolver = _serviceProvider.GetRequiredService<WebSocketHandlerResolver>();
            return resolver.Resolve(type);
        }

        protected virtual async Task<string> ReadAsync(WebSocket webSocket, CancellationToken cancellation = default)
        {
            byte[] buffer = new byte[4096];
            StringBuilder stringBuilder = new StringBuilder();

            try
            {
                bool endOfMessage = false;

                do
                {
                    WebSocketReceiveResult result = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), cancellation);

                    string partialMessage = Encoding.UTF8.GetString(buffer, 0, result.Count);
                    stringBuilder.Append(partialMessage);

                    if (result.CloseStatus.HasValue)
                    {
                        await webSocket.CloseAsync(result.CloseStatus.Value, result.CloseStatusDescription, cancellation);
                        return null;
                    }

                    endOfMessage = result.EndOfMessage;

                } while (!endOfMessage);

                return stringBuilder.ToString();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"⚠️ WebSocket desconectado abruptamente: {ex.Message}");
                return null;
            }
        }

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
