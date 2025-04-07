using the_enigma_casino_server.Games.Shared.Entities;
using System.Threading;

public class ActiveGameSession
{
    public Table Table { get; }

    private readonly Action<int> _onTimerComplete;
    private readonly System.Threading.Timer _startTimer;

    private bool _isTimerRunning;
    private bool _countdownCancelled;

    private readonly object _lock = new();

    public bool IsTimerRunning => _isTimerRunning;

    public ActiveGameSession(Table table, Action<int> onTimerComplete)
    {
        Table = table;
        _onTimerComplete = onTimerComplete;
        _startTimer = new Timer(_ => HandleTimerElapsed(), null, Timeout.Infinite, Timeout.Infinite);
    }

    public void StartOrRestartCountdown()
    {
        lock (_lock)
        {
            _countdownCancelled = false;
            _startTimer.Change(10_000, Timeout.Infinite);
            _isTimerRunning = true;
        }
    }

    public void CancelCountdown()
    {
        lock (_lock)
        {
            _countdownCancelled = true;
            _startTimer.Change(Timeout.Infinite, Timeout.Infinite);
            _isTimerRunning = false;
            Console.WriteLine($"[ActiveGameSession] Temporizador CANCELADO para mesa {Table.Id}");
        }
    }


    private void HandleTimerElapsed()
    {
        lock (_lock)
        {
            if (_countdownCancelled)
            {
                Console.WriteLine($"[ActiveGameSession] ❌ Timer ignorado (cancelado) para mesa {Table.Id}");
                return;
            }

            if (!_isTimerRunning)
            {
                Console.WriteLine($"[ActiveGameSession] ❌ Timer ignorado (no estaba activo) para mesa {Table.Id}");
                return;
            }

            _isTimerRunning = false;
        }

        Console.WriteLine($"[ActiveGameSession] ✅ Timer completado para mesa {Table.Id}. Iniciando juego...");
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