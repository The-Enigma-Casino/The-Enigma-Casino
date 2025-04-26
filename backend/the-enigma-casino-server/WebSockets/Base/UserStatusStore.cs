using System.Collections.Concurrent;
using the_enigma_casino_server.Core.Entities.Enum;

namespace the_enigma_casino_server.WebSockets.Base
{
    public static class UserStatusStore
    {
        private static readonly ConcurrentDictionary<int, UserStatus> _statuses = new();

        public static void SetStatus(int userId, UserStatus status)
        {
            _statuses[userId] = status;
        }

        public static UserStatus GetStatus(int userId)
        {
            return _statuses.TryGetValue(userId, out var status)
                ? status
                : UserStatus.Offline;
        }

        public static IReadOnlyDictionary<int, UserStatus> GetAll()
        {
            return _statuses;
        }

        public static void ClearStatus(int userId)
        {
            _statuses.TryRemove(userId, out _);
        }
    }
}