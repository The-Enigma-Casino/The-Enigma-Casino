namespace the_enigma_casino_server.WebSockets.Poker;

public static class PokerMessageType
{
    public const string PlaceBet = "place_bet";
    public const string PlayerAction = "player_action"; // fold, call, raise, check, all-in
    public const string DealFlop = "deal_flop";
    public const string DealTurn = "deal_turn";
    public const string DealRiver = "deal_river";
    public const string Showdown = "showdown";

    public const string GameState = "game_state"; // Para reenviar el estado completo
    public const string WinnerAnnouncement = "winner_announcement";
}

