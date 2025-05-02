namespace the_enigma_casino_server.Websockets.Roulette;

public static class RouletteMessageType
{
    public const string PlaceBet = "place_bet"; // Hace apuesta
    public const string Spin = "spin"; // Tira ruleta
    public const string GameState = "game_state";
    public const string SpinResult = "spin_result"; // Resultado de tirar ruleta
    public const string RequestGameState = "request_game_state"; // Extra *** devuelve game_state, implementar para hacer reconexion de usuario
    public const string WheelState = "wheel_state";

    // Implementar contador en front alerta
    public const string BetsOpened = "bets_opened"; // Apuestas abiertas
    public const string BetsClosed = "bets_closed"; // Apuestas cerradas

    // Pausa de ruleta
    public const string RouletteStoped = "roulette_stoped"; // Pausa tras 5 rondas sin actividad
    public const string RoulettePaused = "roulette_paused"; // Pausa tras cerrar apuestas (BetsClosed)
}
