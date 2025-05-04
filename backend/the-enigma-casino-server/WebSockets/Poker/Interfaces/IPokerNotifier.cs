using the_enigma_casino_server.Games.Poker;
using the_enigma_casino_server.Games.Shared.Entities;

namespace the_enigma_casino_server.WebSockets.Poker.Interfaces;

public interface IPokerNotifier
{
    Task NotifyBlindsAsync(Match match, PokerGame game);
    Task SendInitialHandsAsync(Match match);
    Task NotifyStartBettingAsync(Match match);
    Task NotifyPlayerTurnAsync(Match match, Player player, PokerGame pokerGame);
    Task NotifyPlayerActionAsync(Player player, string move);
    Task NotifyBetConfirmedAsync(Player player);
    Task NotifyPlayersInitializedAsync(Match match);
}