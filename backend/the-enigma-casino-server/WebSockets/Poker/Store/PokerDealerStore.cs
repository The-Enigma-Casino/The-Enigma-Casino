using System.Collections.Concurrent;

namespace the_enigma_casino_server.WebSockets.Poker.Store;

public static class PokerDealerStore
{
    private static readonly ConcurrentDictionary<int, int> _lastDealerByTable = new();

    public static void SetDealer(int tableId, int dealerUserId)
    {
        _lastDealerByTable[tableId] = dealerUserId;
    }

    public static int? GetLastDealer(int tableId)
    {
        if (_lastDealerByTable.TryGetValue(tableId, out var dealerUserId))
            return dealerUserId;

        return null;
    }

    public static void RemoveDealer(int tableId)
    {
        _lastDealerByTable.TryRemove(tableId, out _);
    }
}