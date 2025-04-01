using the_enigma_casino_server.Games.Shared.Entities.Enum;

namespace the_enigma_casino_server.WS.GameWS.Services.Models;

public class PlayerLeaveResult
{
    public bool PlayerRemoved { get; set; }
    public bool StopCountdown { get; set; }
    public List<string> ConnectedUsers { get; set; } = new();
    public string[] PlayerNames { get; set; } = Array.Empty<string>();
    public TableState State { get; set; }
}

