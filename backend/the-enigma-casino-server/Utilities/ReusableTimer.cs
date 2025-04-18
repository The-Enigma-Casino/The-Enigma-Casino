namespace the_enigma_casino_server.Utilities;

public class ReusableTimer
{
    private readonly Action _callback;
    private Timer _timer;
    private bool _isRunning;
    private readonly object _lock = new();

    public bool IsRunning => _isRunning;

    public ReusableTimer(Action callback)
    {
        _callback = callback;
        _timer = new Timer(_ => Trigger(), null, Timeout.Infinite, Timeout.Infinite);
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

    private void Trigger()
    {
        lock (_lock)
        {
            if (!_isRunning) return;
            _isRunning = false;
        }

        _callback?.Invoke();
    }
}