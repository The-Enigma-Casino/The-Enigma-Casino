﻿using the_enigma_casino_server.Core.Entities;
using the_enigma_casino_server.Games.Shared.Entities;
using the_enigma_casino_server.Games.Shared.Enum;
using the_enigma_casino_server.WebSockets.Interfaces;

namespace the_enigma_casino_server.WebSockets.GameTable;

public class GameTableJoinGuard
{
    private readonly HashSet<GameType> _usesHasAbandoned = new() { GameType.Poker };
    private readonly IGameBetInfoProvider _betInfoProvider;

    public GameTableJoinGuard(IGameBetInfoProvider betInfoProvider)
    {
        _betInfoProvider = betInfoProvider;
    }

    public bool CanJoin(Table table, User user, out string errorReason)
    {
        errorReason = string.Empty;

        if (table.TableState == TableState.Maintenance)
        {
            errorReason = "maintenance";
            Console.WriteLine($"[JoinGuard] Mesa {table.Id} está en mantenimiento. Usuario {user.NickName} rechazado.");
            return false;
        }

        var existingPlayer = table.Players.FirstOrDefault(p => p.UserId == user.Id);

        if (existingPlayer != null)
        {
            if (existingPlayer.PlayerState == PlayerState.Left)
            {
                errorReason = "already_left";
                return false;
            }

            if (_usesHasAbandoned.Contains(table.GameType) && existingPlayer.HasAbandoned)
            {
                errorReason = "already_left";
                return false;
            }

            if (existingPlayer.PlayerState == PlayerState.Spectating)
            {
                Console.WriteLine($"[JoinGuard] {user.NickName} está spectating. Permitido rejoin.");
                return true;
            }

            errorReason = "already_joined";
            return false;
        }


        if (table.Players.Count(p => p.PlayerState != PlayerState.Left && !p.HasAbandoned) >= table.MaxPlayer)
        {
            errorReason = "table_full";
            Console.WriteLine($"[JoinGuard] Mesa {table.Id} llena. Usuario {user.NickName} rechazado.");
            return false;
        }

        int minimumCoins = _betInfoProvider.GetMinimumRequiredCoins();
        if (user.Coins < minimumCoins)
        {
            errorReason = "insufficient_coins";
            Console.WriteLine($"[JoinGuard] {user.NickName} tiene {user.Coins} fichas. Se requieren al menos {minimumCoins}. Rechazado.");
            return false;
        }

        return true;
    }
}
