using the_enigma_casino_server.Games.Roulette.Enums;

namespace the_enigma_casino_server.Games.Roulette;

public class RouletteBet
{
    public RouletteBetType BetType { get; set; }
    public int Amount { get; set; }

    #region Parámetros específicos por tipo

    public int? Number { get; set; }       
    public string? Color { get; set; }     
    public RouletteSimpleChoice? EvenOdd { get; set; }
    public int? Dozen { get; set; }        
    public int? Column { get; set; }   
    public RouletteSimpleChoice? HighLow { get; set; }

    #endregion

    public int CalculatePayoutMultiplier() => BetType switch
    {
        RouletteBetType.Straight => 35,
        RouletteBetType.Color => 1,
        RouletteBetType.EvenOdd => 1,
        RouletteBetType.Dozen => 2,
        RouletteBetType.Column => 2,
        RouletteBetType.HighLow => 1,
        _ => 0
    };

    public bool IsValid() => BetType switch
    {
        RouletteBetType.Straight => Number is >= 0 and <= 36,
        RouletteBetType.Color => Color is "red" or "black",
        RouletteBetType.EvenOdd => EvenOdd != null,
        RouletteBetType.Dozen => Dozen is >= 1 and <= 3,
        RouletteBetType.Column => Column is >= 1 and <= 3,
        RouletteBetType.HighLow => HighLow != null,
        _ => false
    };

    public override string ToString() => BetType switch
    {
        RouletteBetType.Straight => $"Pleno al {Number}",
        RouletteBetType.Color => $"Color: {Color}",
        RouletteBetType.EvenOdd => $"Par/Impar: {EvenOdd}",
        RouletteBetType.Dozen => $"Docena: {Dozen}",
        RouletteBetType.Column => $"Columna: {Column}",
        RouletteBetType.HighLow => $"Alta/Baja: {HighLow}",
        _ => "Apuesta desconocida"
    };
}