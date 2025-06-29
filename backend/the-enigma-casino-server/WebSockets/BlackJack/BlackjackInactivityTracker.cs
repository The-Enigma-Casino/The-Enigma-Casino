﻿using System.Collections.Concurrent;
using the_enigma_casino_server.Games.Shared.Entities;
using the_enigma_casino_server.Games.Shared.Enum;
using the_enigma_casino_server.WebSockets.Interfaces;

namespace the_enigma_casino_server.WebSockets.BlackJack
{
    public class BlackjackInactivityTracker : IGameInactivityTracker
    {
        private static readonly ConcurrentDictionary<int, int> _inactivityCounts = new();

        private const int MaxAllowedInactivity = 2;

        public GameType ForGameType => GameType.BlackJack;

        public void RegisterInactivity(Player player)
        {
            _inactivityCounts.AddOrUpdate(player.UserId, 1, (_, current) => current + 1);
        }

        public void ResetActivity(Player player)
        {
            if (_inactivityCounts.TryRemove(player.UserId, out _))
            {
                Console.WriteLine($"✅ [BlackjackInactivityTracker] Inactividad reseteada para {player.User.NickName}.");
            }
        }

        public void RemovePlayer(Player player)
        {
            _inactivityCounts.TryRemove(player.UserId, out _);
        }

        public bool ShouldKickPlayer(Player player)
        {
            return _inactivityCounts.TryGetValue(player.UserId, out int count) && count >= MaxAllowedInactivity;
        }
    }
}