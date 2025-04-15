using the_enigma_casino_server.Games.Shared.Entities;
using the_enigma_casino_server.Games.Shared.Enum;
using the_enigma_casino_server.WebSockets.Interfaces;

namespace the_enigma_casino_server.WebSockets.Poker;

public class PokerTurnService : IGameTurnService
{
    public List<int> GetExpectedPlayers(Match match)
    {
        return match.Players
            .Where(p => p.PlayerState == PlayerState.Playing || p.PlayerState == PlayerState.AllIn)
            .Select(p => p.UserId)
            .ToList();
    }

    public bool IsPlayerTurn(Match match, int userId)
    {
        return true;
    }

    public async Task ForceAdvanceTurnAsync(int tableId, int userId)
    {
        Console.WriteLine($"🌀 [PokerTurnService] Forzando avance de turno en mesa {tableId} por salida del jugador {userId}.");
        await Task.CompletedTask;
    }
}
