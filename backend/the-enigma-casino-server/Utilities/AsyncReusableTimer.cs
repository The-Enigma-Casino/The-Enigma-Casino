namespace the_enigma_casino_server.Utilities;

public class AsyncReusableTimer
{
    private readonly Func<Task> _callback;
    private Timer _timer;
    private bool _isRunning;
    private readonly object _lock = new();

    public bool IsRunning => _isRunning;

    public AsyncReusableTimer(Func<Task> callback)
    {
        _callback = callback;
        _timer = new Timer(OnTimerElapsed, null, Timeout.Infinite, Timeout.Infinite);
    }

    public void Start(int milliseconds)
    {
        lock (_lock)
        {
            _isRunning = true;
            _timer.Change(milliseconds, Timeout.Infinite);
        }
    }

    public void Cancel()
    {
        lock (_lock)
        {
            _isRunning = false;
            _timer.Change(Timeout.Infinite, Timeout.Infinite);
        }
    }

    private async void OnTimerElapsed(object state)
    {
        lock (_lock)
        {
            if (!_isRunning) return;
            _isRunning = false;
        }

        try
        {
            await _callback();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ [AsyncReusableTimer] Error en callback: {ex.Message}");
        }
    }
}