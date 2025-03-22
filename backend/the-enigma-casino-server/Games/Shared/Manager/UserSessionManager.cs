using the_enigma_casino_server.Games.Shared.Entities;

public class UserSessionManager
{
    private readonly Dictionary<(int userId, int tableId), UserSession> _sessions = new();

    public void StartSession(int userId, int tableId, int currentChips)
    {
        _sessions[(userId, tableId)] = new UserSession
        {
            UserId = userId,
            GameTableId = tableId,
            StartingChips = currentChips,
            JoinedAt = DateTime.UtcNow
        };
    }

    public UserSession? EndSession(int userId, int tableId, int currentChips)
    {
        if (_sessions.TryGetValue((userId, tableId), out var session))
        {
            session.EndingChips = currentChips;
            session.LeftAt = DateTime.UtcNow;

            _sessions.Remove((userId, tableId));
            return session;
        }

        return null;
    }

    public bool IsUserInSession(int userId, int tableId)
    {
        return _sessions.ContainsKey((userId, tableId));
    }
}
