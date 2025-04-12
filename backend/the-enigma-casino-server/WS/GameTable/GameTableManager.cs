using System.Collections.Concurrent;
using the_enigma_casino_server.Games.Shared.Entities;
using the_enigma_casino_server.Games.Shared.Entities.Enum;
using the_enigma_casino_server.Models.Database.Entities;
using the_enigma_casino_server.WS.GameTable.Models;

namespace the_enigma_casino_server.WS.GameWS.Services;

public class GameTableManager
{
    private readonly ConcurrentDictionary<int, DateTime> _lastJoinTimestamps = new();
    private const int JoinCooldownSeconds = 15;

    public bool CanJoinTable(int userId)
    {
        if (_lastJoinTimestamps.TryGetValue(userId, out DateTime lastTime))
        {
            if ((DateTime.Now - lastTime).TotalSeconds < JoinCooldownSeconds) return false;
        }

        _lastJoinTimestamps[userId] = DateTime.Now;
        return true;
    }

    public bool RemovePlayerFromTable(Table table, int userId, out Player? removedPlayer)
    {
        removedPlayer = table.Players.FirstOrDefault(p => p.UserId == userId);
        if (removedPlayer != null)
        {
            removedPlayer.JoinedAt = null;
            table.Players.Remove(removedPlayer);
            return true;
        }

        return false;
    }

    public PlayerLeaveResult ProcessPlayerLeaving(Table table, ActiveGameSession session, int userId)
    {
        bool stopCountdown = false;

        if (!RemovePlayerFromTable(table, userId, out Player player))
        {
            return new PlayerLeaveResult
            {
                PlayerRemoved = false,
                StopCountdown = false,
                ConnectedUsers = new List<string>(),
                PlayerNames = Array.Empty<string>(),
                State = table.TableState
            };
        }

        if (table.Players.Count < table.MinPlayer)
        {
            session.CancelCountdown();
            stopCountdown = true;
        }

        return new PlayerLeaveResult
        {
            PlayerRemoved = true,
            StopCountdown = stopCountdown,
            ConnectedUsers = session.GetConnectedUserIds().ToList(),
            PlayerNames = session.GetPlayerNames().ToArray(),
            State = table.TableState
        };
    }

    public (bool Success, string? ErrorMessage) TryAddPlayer(Table table, User user)
    {
        if (table.TableState != TableState.Waiting)
        {
            string msg = $"La mesa {table.Id} no está esperando jugadores. Estado actual: {table.TableState}.";
            return (false, msg);
        }

        if (table.Players.Any(p => p.UserId == user.Id))
        {
            string msg = $"El usuario {user.Id} ya está en la mesa {table.Id}.";
            return (false, msg);
        }

        if (table.Players.Count >= table.MaxPlayer)
        {
            string msg = $"La mesa {table.Id} está llena ({table.Players.Count}/{table.MaxPlayer}).";
            return (false, msg);
        }

        Player player = new Player(user)
        {
            JoinedAt = DateTime.Now
        };

        table.AddPlayer(player);
        return (true, null);
    }
}