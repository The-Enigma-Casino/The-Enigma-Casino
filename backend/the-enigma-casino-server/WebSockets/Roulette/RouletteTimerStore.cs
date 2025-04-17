using System.Collections.Concurrent;

namespace the_enigma_casino_server.Websockets.Roulette;

public static class RouletteTimerStore
{
    private static readonly ConcurrentDictionary<int, CancellationTokenSource> _timers = new();
    private static readonly ConcurrentDictionary<int, DateTime> _startTimes = new();

    public static void StartRecurringTimer(int tableId, Func<Task<bool>> callback, int seconds)
    {
        CancelTimer(tableId);

        var cts = new CancellationTokenSource();
        _timers[tableId] = cts;
        _startTimes[tableId] = DateTime.UtcNow;

        _ = Task.Run(async () =>
        {
            while (!cts.Token.IsCancellationRequested)
            {
                try
                {
                    await Task.Delay(TimeSpan.FromSeconds(seconds), cts.Token);
                    if (!cts.Token.IsCancellationRequested)
                    {
                        bool shouldContinue = await callback();
                        if (!shouldContinue)
                        {
                            CancelTimer(tableId);
                            break;
                        }
                        _startTimes[tableId] = DateTime.UtcNow;
                    }
                }
                catch (TaskCanceledException)
                {
                    break;
                }
            }
        });
    }

    public static void CancelTimer(int tableId)
    {
        if (_timers.TryRemove(tableId, out var cts))
        {
            cts.Cancel();
        }
    }

    public static bool IsTimerRunning(int tableId)
    {
        return _timers.ContainsKey(tableId);
    }

    public static int GetSecondsRemaining(int tableId, int totalSeconds)
    {
        if (_startTimes.TryGetValue(tableId, out var startTime))
        {
            var elapsed = (int)(DateTime.UtcNow - startTime).TotalSeconds;
            var remaining = totalSeconds - elapsed;
            return remaining > 0 ? remaining : 0;
        }
        return totalSeconds;
    }
}
