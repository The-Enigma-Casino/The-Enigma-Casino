using the_enigma_casino_server.Games.Shared.Entities;

public class ActiveGameSession
{
    public GameTable Table { get; }

    private readonly Action<int> _onTimerComplete;
    private readonly System.Threading.Timer _startTimer;
    private bool _isTimerRunning;

    private readonly object _lock = new();

    public bool IsTimerRunning => _isTimerRunning;

    public ActiveGameSession(GameTable table, Action<int> onTimerComplete)
    {
        Table = table;
        _onTimerComplete = onTimerComplete;

        _startTimer = new System.Threading.Timer(_ => HandleTimerElapsed(), null, Timeout.Infinite, Timeout.Infinite);
    }

    public void StartOrRestartCountdown()
    {
        lock (_lock)
        {
            _startTimer.Change(30000, Timeout.Infinite); 
            _isTimerRunning = true;
        }
    }

    public void CancelCountdown()
    {
        lock (_lock)
        {
            _startTimer.Change(Timeout.Infinite, Timeout.Infinite);
            _isTimerRunning = false;
        }
    }

    private void HandleTimerElapsed()
    {
        // Este lock es para que si alguien en el último segundo entra, no se empiece la partida antes de tiempo
        lock (_lock)
        {
            if (!_isTimerRunning) return;

            _isTimerRunning = false;
        }

        Console.WriteLine($"[ActiveGameSession] Timer completado para mesa {Table.Id}. Iniciando juego...");
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
