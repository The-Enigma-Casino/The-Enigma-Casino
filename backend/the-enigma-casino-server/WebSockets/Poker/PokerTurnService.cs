using the_enigma_casino_server.Games.Shared.Entities;
using the_enigma_casino_server.Games.Shared.Enum;
using the_enigma_casino_server.WebSockets.Interfaces;
using the_enigma_casino_server.WebSockets.Poker.Store;

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
        int tableId = match.GameTableId;

        if (!ActivePokerGameStore.TryGet(tableId, out var pokerGame))
        {
            Console.WriteLine($"No se encontró juego activo para mesa {tableId}.");
            return false;
        }

        return pokerGame.CurrentTurnUserId == userId;
    }

    public async Task ForceAdvanceTurnAsync(int tableId, int userId)
    {
        if (!ActivePokerGameStore.TryGet(tableId, out var pokerGame))
            return;

        if (pokerGame.CurrentTurnUserId != userId)
            return;

        pokerGame.AdvanceTurn();
        await Task.CompletedTask;
    }
}