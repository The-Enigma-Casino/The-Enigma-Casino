namespace the_enigma_casino_server.Games.Roulette.Enums;

public enum RouletteBetType
{
    Straight,   // Pleno (paga 35:1)
    Color,      // Rojo o Negro (1:1)
    EvenOdd,    // Par o Impar (1:1)
    Dozen,      // Docenas: 1–12, 13–24, 25–36 (2:1)
    Column,     // Columnas: 1ª, 2ª, 3ª (2:1)
    HighLow     // Bajo (1–18) o Alto (19–36) (1:1)
}