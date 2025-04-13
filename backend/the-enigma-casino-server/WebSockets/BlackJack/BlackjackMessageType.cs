namespace the_enigma_casino_server.WebSockets.BlackJack;

public static class BlackjackMessageType
{
    public const string DealInitialCards = "deal_initial_cards";
    public const string PlaceBet = "place_bet";

    public const string PlayerHit = "player_hit";
    public const string PlayerStand = "player_stand";
    public const string DoubleDown = "double_down";

    public const string GameState = "game_state";
}