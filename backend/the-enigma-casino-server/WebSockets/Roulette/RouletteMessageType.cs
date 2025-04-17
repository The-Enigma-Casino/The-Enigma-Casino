namespace the_enigma_casino_server.Websockets.Roulette;

public static class RouletteMessageType
{
    public const string PlaceBet = "place_bet";
    public const string Spin = "spin";
    public const string GameState = "game_state";
    public const string SpinResult = "spin_result";
    public const string RequestGameState = "request_game_state";

    // Implementar contador en fronto alerta
    public const string BetsOpened = "bets_opened";
    public const string BetsClosed = "bets_closed";
}
