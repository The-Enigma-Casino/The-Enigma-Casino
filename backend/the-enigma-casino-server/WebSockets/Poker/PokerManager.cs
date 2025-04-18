using the_enigma_casino_server.Games.Poker;
using the_enigma_casino_server.Games.Shared.Entities;
using the_enigma_casino_server.Games.Shared.Enum;
using the_enigma_casino_server.Infrastructure.Database;
using the_enigma_casino_server.WebSockets.Poker;
using the_enigma_casino_server.WebSockets.Poker.Store;

namespace the_enigma_casino_server.Websockets.Poker;

public static class PokerManager
{
    public static async Task<PokerGameService> StartNewRound(Match match, IServiceProvider serviceProvider)
    {
        PokerNotifier notifier = serviceProvider.GetRequiredService<PokerNotifier>();

        PokerGameService pokerGame = new(match, notifier);
        pokerGame.StartRound();
        await pokerGame.AssignBlinds();

        ActivePokerGameStore.Set(match.GameTableId, pokerGame);

        return pokerGame;
    }

    public static bool ExecutePlayerMove(PokerGameService game, Match match, Player player, string move, int amount)
    {
        string phase = game.GetCurrentPhase();

        switch (move)
        {
            case "check":
                if (player.CurrentBet < match.Players.Max(p => p.CurrentBet))
                    throw new InvalidOperationException("No puedes hacer check, hay una apuesta activa.");
                return true;

            case "call":
                int toCall = match.Players.Max(p => p.CurrentBet) - player.CurrentBet;
                if (toCall <= 0) throw new InvalidOperationException("No tienes nada que igualar.");
                if (toCall > player.User.Coins) toCall = player.User.Coins;
                game.HandlePokerBet(player, toCall);
                return true;

            case "raise":
                if (amount <= 0 || amount > player.User.Coins)
                    throw new InvalidOperationException("Cantidad de raise no válida.");

                int currentMax = match.Players.Max(p => p.CurrentBet);
                int totalBet = (currentMax - player.CurrentBet) + amount;

                if (totalBet > player.User.Coins)
                    throw new InvalidOperationException("No tienes suficientes fichas para hacer raise.");

                game.HandlePokerBet(player, totalBet);

                PokerActionTracker.ResetActionsForRaise(
                    match.GameTableId,
                    match.Players.Where(p => p.PlayerState == PlayerState.Playing || p.PlayerState == PlayerState.AllIn).Select(p => p.UserId).ToList(),
                    player.UserId,
                    phase
                );
                return true;

            case "all-in":
                game.HandlePokerBet(player, player.User.Coins);
                return true;

            case "fold":
                player.PlayerState = PlayerState.Fold;
                return false;

            default:
                throw new InvalidOperationException("Acción no reconocida.");
        }
    }

    public static async Task RegisterAndMaybeAdvancePhaseAsync(
    int tableId,
    Match match,
    Player player,
    string phase,
    Func<int, string, Task> advancePhaseCallback)
    {
        PokerActionTracker.RegisterAction(tableId, player.UserId, phase);

        var expected = match.Players
            .Where(p => p.PlayerState == PlayerState.Playing || p.PlayerState == PlayerState.AllIn)
            .Select(p => p.UserId)
            .ToList();

        if (PokerActionTracker.HaveAllPlayersActed(tableId, expected, phase))
        {
            PokerActionTracker.Clear(tableId, phase);
            Console.WriteLine($"✅ Todos los jugadores han actuado en fase '{phase}'.");
            await advancePhaseCallback(tableId, phase);
        }
    }

    public static async Task UpdatePlayerCoinsAsync(UnitOfWork unitOfWork, Player player)
    {
        Console.WriteLine($"🔍 [EF DEBUG] ¿Está trackeado el User? {unitOfWork.DbContext.Entry(player.User).State}");

        unitOfWork.UserRepository.Update(player.User);
        await unitOfWork.SaveAsync();

        Console.WriteLine($"✅ Fichas actualizadas en DB para {player.User.NickName}: {player.User.Coins} fichas.");
    }

}