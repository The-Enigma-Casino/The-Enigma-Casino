using System.Collections.Concurrent;
using the_enigma_casino_server.Games.Shared.Entities;
using the_enigma_casino_server.Games.Shared.Entities.Enum;
using the_enigma_casino_server.Models.Database.Entities;
using the_enigma_casino_server.WS.GameTableWS.Models;

namespace the_enigma_casino_server.WS.GameWS.Services;

public class GameTableManager
{
    private readonly ConcurrentDictionary<int, DateTime> _lastJoinTimestamps = new();
    private const int JoinCooldownSeconds = 15;

    public bool CanJoinTable(int userId)
    {
        if (_lastJoinTimestamps.TryGetValue(userId, out var lastTime))
        {
            if ((DateTime.UtcNow - lastTime).TotalSeconds < JoinCooldownSeconds)
            {
                Console.WriteLine($"⏳ Usuario {userId} no puede volver a entrar todavía.");
                return false;
            }
        }

        _lastJoinTimestamps[userId] = DateTime.UtcNow;
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

        if (!RemovePlayerFromTable(table, userId, out var player))
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

        Console.WriteLine($"[GameTableWS] Usuario {userId} salió de la mesa {table.Id}.");

        if (table.Players.Count < table.MinPlayer)
        {
            session.CancelCountdown();
            Console.WriteLine($"[GameTableWS] Temporizador detenido por jugadores insuficientes.");
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
            Console.WriteLine($"❌ {msg}");
            return (false, msg);
        }

        if (table.Players.Any(p => p.UserId == user.Id))
        {
            string msg = $"El usuario {user.Id} ya está en la mesa {table.Id}.";
            Console.WriteLine($"⚠️ {msg}");
            return (false, msg);
        }

        if (table.Players.Count >= table.MaxPlayer)
        {
            string msg = $"La mesa {table.Id} está llena ({table.Players.Count}/{table.MaxPlayer}).";
            Console.WriteLine($"❌ {msg}");
            return (false, msg);
        }

        var player = new Player(user)
        {
            JoinedAt = DateTime.UtcNow 
        };

        table.AddPlayer(player);

        Console.WriteLine($"✅ {user.NickName} se unió a la mesa {table.Id}.");
        return (true, null);
    }
}