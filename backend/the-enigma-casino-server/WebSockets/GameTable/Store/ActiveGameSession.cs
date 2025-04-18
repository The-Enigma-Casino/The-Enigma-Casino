using the_enigma_casino_server.Games.Shared.Entities;
using the_enigma_casino_server.Utilities;

public class ActiveGameSession
{
    public Table Table { get; }

    private readonly Action<int> _onTimerComplete;
    private readonly ReusableTimer _startTimer;

    private bool _isTimerRunning;
    private bool _countdownCancelled;

    private readonly object _lock = new();

    public bool IsTimerRunning => _isTimerRunning;

    public ActiveGameSession(Table table, Action<int> onTimerComplete)
    {
        Table = table;
        _onTimerComplete = onTimerComplete;
        _startTimer = new ReusableTimer(() => HandleTimerElapsed());
    }

    public void StartOrRestartCountdown()
    {
        _startTimer.Start(30_000);
    }

    public void CancelCountdown()
    {
        _startTimer.Cancel();
    }

    private void HandleTimerElapsed()
    {
        _onTimerComplete.Invoke(Table.Id);
    }

    public IEnumerable<string> GetConnectedUserIds()
    {
        return Table.Players.Select(p => p.UserId.ToString());
    }

    public IEnumerable<string> GetPlayerNames()
    {
        return Table.Players.Select(p => p.User.NickName);
    }
}
