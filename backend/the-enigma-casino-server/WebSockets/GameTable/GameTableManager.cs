using System.Collections.Concurrent;
using the_enigma_casino_server.Core.Entities;
using the_enigma_casino_server.Games.Shared.Entities;
using the_enigma_casino_server.Games.Shared.Enum;
using the_enigma_casino_server.Infrastructure.Database;
using the_enigma_casino_server.WebSockets.GameMatch.Store;
using the_enigma_casino_server.WebSockets.GameTable.Models;
using the_enigma_casino_server.WebSockets.GameTable.Store;

namespace the_enigma_casino_server.WebSockets.GameTable;

public class GameTableManager
{
    private readonly ConcurrentDictionary<int, DateTime> _lastJoinTimestamps = new();
    private const int JoinCooldownSeconds = 30;

    private readonly IServiceProvider _serviceProvider;

    public GameTableManager(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    public void RegisterJoinAttempt(int userId)
    {
        _lastJoinTimestamps[userId] = DateTime.Now;
    }

    // Comentado para evitar bugs
    public bool CanJoinTable(int userId)
    {
        return true;
        //if (_lastJoinTimestamps.TryGetValue(userId, out DateTime lastTime))
        //{
        //    double elapsed = (DateTime.Now - lastTime).TotalSeconds;
        //    Console.WriteLine($"⏱️ [CooldownCheck] Last timestamp: {lastTime:HH:mm:ss.fff}, Now: {DateTime.Now:HH:mm:ss.fff}, Elapsed: {elapsed:0.00}s");

        //    if (elapsed < JoinCooldownSeconds)
        //    {
        //        Console.WriteLine($"⏳ [JoinCooldown] Usuario {userId} bloqueado. Tiempo transcurrido: {elapsed:0.00}s");
        //        return false;
        //    }
        //}
        //Console.WriteLine($"✅ [JoinCooldown] Usuario {userId} puede entrar. Cooldown pasado o no aplicado.");
        //_lastJoinTimestamps[userId] = DateTime.Now;
        //return true;
    }

    public PlayerLeaveResult RemovePlayerFromTable(Table table, int userId, out Player removedPlayer)
    {
        removedPlayer = table.Players.FirstOrDefault(p => p.UserId == userId);
        var result = new PlayerLeaveResult
        {
            PlayerRemoved = false,
            StopCountdown = false,
            State = table.TableState
        };

        if (removedPlayer == null)
            return result;

        removedPlayer.JoinedAt = null;
        table.Players.Remove(removedPlayer);

        result.PlayerRemoved = true;

        if (table.Players.Count(p => p.PlayerState != PlayerState.Left && !p.HasAbandoned) < table.MinPlayer &&
            table.TableState == TableState.Starting)
        {
            table.TableState = TableState.Waiting;
            result.StopCountdown = true;
        }

        result.State = table.TableState;
        result.ConnectedUsers = table.Players
            .Where(p => p.PlayerState != PlayerState.Left && !p.HasAbandoned)
            .Select(p => p.UserId.ToString())
            .ToList();

        result.PlayerNames = table.Players
            .Select(p => p.User.NickName)
            .ToArray();

        return result;
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

        PlayerLeaveResult result = RemovePlayerFromTable(table, userId, out Player player);

        if (!result.PlayerRemoved)
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

    public record PlayerJoinResult(bool Success, string ErrorCode, string ErrorMessage);

    public PlayerJoinResult TryAddPlayer(Table table, User user)
    {
        if (table.TableState == TableState.Maintenance)
        {
            return new(false, "maintenance", "La mesa está en mantenimiento.");
        }

        var existingPlayer = table.Players.FirstOrDefault(p => p.UserId == user.Id);
        if (existingPlayer != null)
        {
            if (existingPlayer.PlayerState == PlayerState.Left || existingPlayer.HasAbandoned)
            {
                return new(false, "already_left", "Ya abandonaste esta mesa y no puedes volver.");
            }

            return new(false, "already_joined", $"El usuario {user.Id} ya está en la mesa {table.Id}.");
        }

        if (table.Players.Count(IsActivePlayer) >= table.MaxPlayer)
        {
            return new(false, "table_full", "La mesa está llena.");
        }

        var player = new Player(user)
        {
            JoinedAt = DateTime.Now,
            GameTableId = table.Id,
            PlayerState = table.TableState == TableState.InProgress
                ? PlayerState.Spectating
                : PlayerState.Waiting
        };

        table.AddPlayer(player);
        return new(true, null, null);
    }



    private bool IsActivePlayer(Player player)
    {
        return player.PlayerState != PlayerState.Left && !player.HasAbandoned;
    }

}