namespace the_enigma_casino_server.Games.Roulette;

public class RouletteSpinResult
{
    public int Number { get; set; }                      // Número ganador
    public required string Color { get; set; }           // "red", "black", "green"
    public required RouletteBet Bet { get; set; }        // Apuesta del jugador
    public bool Won { get; set; }                        // ¿Ganó esta apuesta?
    public int Payout { get; set; }                      // Ganancia (sin contar la apuesta)
    public int RemainingCoins { get; set; }              // Fichas que le quedan al jugador
}