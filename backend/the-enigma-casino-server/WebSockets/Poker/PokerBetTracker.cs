using System.Collections.Concurrent;

namespace the_enigma_casino_server.WebSockets.Poker;

public static class PokerBetTracker
{
    private static readonly ConcurrentDictionary<int, Dictionary<int, int>> _betsByTable = new();
    private static readonly ConcurrentDictionary<int, Dictionary<int, int>> _winningsByTable = new();
    private static readonly ConcurrentDictionary<int, Dictionary<int, int>> _lastBetsByTable = new();


    public static void RegisterBet(int tableId, int userId, int amount)
    {
        if (!_betsByTable.ContainsKey(tableId))
            _betsByTable[tableId] = new Dictionary<int, int>();

        if (!_betsByTable[tableId].ContainsKey(userId))
            _betsByTable[tableId][userId] = 0;

        _betsByTable[tableId][userId] += amount;
    }

    public static void RegisterWinnings(int tableId, int userId, int amount)
    {
        if (!_winningsByTable.ContainsKey(tableId))
            _winningsByTable[tableId] = new Dictionary<int, int>();

        if (!_winningsByTable[tableId].ContainsKey(userId))
            _winningsByTable[tableId][userId] = 0;

        _winningsByTable[tableId][userId] += amount;
    }

    public static int GetTotalBet(int tableId, int userId)
    {
        if (_betsByTable.TryGetValue(tableId, out var dict))
        {
            if (dict.TryGetValue(userId, out var amount))
            {
                Console.WriteLine($"✅ [DEBUG] TotalBet para user {userId} en mesa {tableId}: {amount}");
                return amount;
            }
            else
            {
                Console.WriteLine($"⚠️ [DEBUG] No se encontró apuesta para user {userId} en mesa {tableId}.");
            }
        }
        else
        {
            Console.WriteLine($"❌ [DEBUG] No hay registro de apuestas para la mesa {tableId}.");
        }

        return 0;
    }


    public static int GetTotalWinnings(int tableId, int userId)
    {
        if (_winningsByTable.TryGetValue(tableId, out var dict) && dict.TryGetValue(userId, out var amount))
            return amount;

        return 0;
    }

    public static int GetChipResult(int tableId, int userId)
    {
        return GetTotalWinnings(tableId, userId) - GetTotalBet(tableId, userId);
    }

    public static void ClearPlayer(int tableId, int userId)
    {
        if (_betsByTable.TryGetValue(tableId, out var betDict))
            betDict.Remove(userId);

        if (_winningsByTable.TryGetValue(tableId, out var winDict))
            winDict.Remove(userId);

        if (_lastBetsByTable.TryGetValue(tableId, out var lastDict))
            lastDict.Remove(userId);
    }
}
