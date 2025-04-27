using the_enigma_casino_server.Games.Shared.Entities;
using the_enigma_casino_server.Websockets.Chat;
using the_enigma_casino_server.Utilities;

public class ActiveGameSession
{
    public Table Table { get; }

    private readonly Action<int> _onTimerComplete;

    private readonly AsyncReusableTimer _startTimer;
    private AsyncReusableTimer _postMatchTimer;
    private AsyncReusableTimer _bettingTimer;
    private AsyncReusableTimer _turnTimer;


    private bool _isTimerRunning;
    private bool _countdownCancelled;

    private readonly object _lock = new();

    public bool IsPostMatchTimerRunning => _postMatchTimer?.IsRunning == true;

    public List<ChatMessage> ChatMessages { get; } = new();

    public ActiveGameSession(Table table, Action<int> onTimerComplete)
    {
        Table = table;
        _onTimerComplete = onTimerComplete;
        _startTimer = new AsyncReusableTimer(() =>
        {
            _onTimerComplete.Invoke(Table.Id);
            return Task.CompletedTask;
        });
    }

    // Timer de inicio
    public void StartOrRestartCountdown()
    {
        _startTimer.Start(5_000);
    }

    public void CancelCountdown()
    {
        _startTimer.Cancel();
    }

    private void HandleTimerElapsed()
    {
        _onTimerComplete.Invoke(Table.Id);
    }

    // Timer entre matches
    public void StartPostMatchTimer(int milliseconds, Func<Task> onTimerCompleteAsync)
    {
        CancelPostMatchTimer();

        _postMatchTimer = new AsyncReusableTimer(onTimerCompleteAsync);
        _postMatchTimer.Start(milliseconds);
    }

    public void CancelPostMatchTimer()
    {
        _postMatchTimer?.Cancel();
        _postMatchTimer = null;
    }

    public IEnumerable<string> GetConnectedUserIds()
    {
        return Table.Players.Select(p => p.UserId.ToString());
    }

    public IEnumerable<string> GetPlayerNames()
    {
        return Table.Players.Select(p => p.User.NickName);
    }

    // Timer de apuestas de ruleta
    public void StartBettingTimer(int milliseconds, Func<Task> onTimerCompleteAsync)
    {
        CancelBettingTimer();

        _bettingTimer = new AsyncReusableTimer(onTimerCompleteAsync);
        _bettingTimer.Start(milliseconds);
    }

    public void CancelBettingTimer()
    {
        _bettingTimer?.Cancel();
        _bettingTimer = null;
    }

    public void StartTurnTimer(int milliseconds, Func<Task> onTimerCompleteAsync)
    {
        CancelTurnTimer();
        _turnTimer = new AsyncReusableTimer(onTimerCompleteAsync);
        _turnTimer.Start(milliseconds);
    }

    public void CancelTurnTimer()
    {
        _turnTimer?.Cancel();
        _turnTimer = null;
    }
}
