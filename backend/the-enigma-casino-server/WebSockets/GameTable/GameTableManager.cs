using System.Collections.Concurrent;
using the_enigma_casino_server.Core.Entities;
using the_enigma_casino_server.Games.Shared.Entities;
using the_enigma_casino_server.Games.Shared.Enum;
using the_enigma_casino_server.WebSockets.GameMatch.Store;
using the_enigma_casino_server.WebSockets.GameTable.Models;

namespace the_enigma_casino_server.WebSockets.GameTable;

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

    public bool RemovePlayerFromTable(Table table, int userId, out Player removedPlayer)
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

        bool isInMatch = ActiveGameMatchStore.TryGet(table.Id, out Match activeMatch) &&
                 activeMatch.Players.Any(p => p.UserId == userId);

        if (table.TableState == TableState.InProgress && isInMatch)
        {
            return new PlayerLeaveResult
            {
                PlayerRemoved = false,
                StopCountdown = false,
                StateChanged = false,
                ConnectedUsers = session.GetConnectedUserIds().ToList(),
                PlayerNames = session.GetPlayerNames().ToArray(),
                State = table.TableState
            };
        }


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

        bool stopCountdown = false;

        if (table.Players.Count < table.MinPlayer)
        {
            session.CancelCountdown();
            stopCountdown = true;
            table.TableState = TableState.Waiting;
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

    public (bool Success, string ErrorMessage) TryAddPlayer(Table table, User user)
    {
        if (table.TableState == TableState.Maintenance)
        {
            return (false, "maintenance");
        }

        Player existingPlayer = table.Players.FirstOrDefault(p => p.UserId == user.Id);

        if (existingPlayer != null)
        {
            if (existingPlayer.PlayerState == PlayerState.Left || existingPlayer.HasAbandoned)
            {
                Console.WriteLine($"[JoinTable] Usuario {user.NickName} intentó volver pero ya abandonó la partida.");
                return (false, "already_left");
            }

            string msg = $"El usuario {user.Id} ya está en la mesa {table.Id}.";
            return (false, msg);
        }

        if (table.Players.Count(IsActivePlayer) >= table.MaxPlayer)
        {
            string msg = $"La mesa {table.Id} está llena ({table.Players.Count(IsActivePlayer)}/{table.MaxPlayer}).";
            return (false, msg);
        }

        Player player = new Player(user)
        {
            JoinedAt = DateTime.Now,
            GameTableId = table.Id,
            PlayerState = table.TableState == TableState.InProgress
                ? PlayerState.Spectating
                : PlayerState.Waiting
        };

        table.AddPlayer(player);
        return (true, null);
    }


    private bool IsActivePlayer(Player player)
    {
        return player.PlayerState != PlayerState.Left && !player.HasAbandoned;
    }
}