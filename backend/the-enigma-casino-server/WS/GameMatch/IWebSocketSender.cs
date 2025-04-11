public interface IWebSocketSender
{
    Task SendToUserAsync(string userId, object message);
    Task BroadcastToUsersAsync(IEnumerable<string> userIds, object message);
}
