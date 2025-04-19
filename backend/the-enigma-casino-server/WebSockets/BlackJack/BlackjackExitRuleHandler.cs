using the_enigma_casino_server.Games.Shared.Entities;
using the_enigma_casino_server.Games.Shared.Enum;
using the_enigma_casino_server.Infrastructure.Database;
using the_enigma_casino_server.WebSockets.Interfaces;

namespace the_enigma_casino_server.WebSockets.BlackJack;

public class BlackjackExitRuleHandler : IGameExitRuleHandler
{
    private readonly UnitOfWork _unitOfWork;

    public BlackjackExitRuleHandler(UnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> HandlePlayerExitAsync(Player player, Match match)
    {
        if (ActiveBlackjackGameStore.TryGet(match.GameTableId, out var game) && !match.GameTable.Croupier.Hand.Cards.Any())
        {
            // El juego aún no ha empezado, se puede devolver la apuesta
            player.User.Coins += player.CurrentBet;
            player.CurrentBet = 0;

            _unitOfWork.UserRepository.Update(player.User);
            await _unitOfWork.SaveAsync();
            return true;
        }

        player.PlayerState = PlayerState.Left;
        return true;
    }
}
