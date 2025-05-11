using the_enigma_casino_server.Games.Shared.Enum;

namespace the_enigma_casino_server.Application.Dtos;

public class BigWinDto
{
    public string Nickname { get; set; }
    public GameType GameType { get; set; }
    public int AmountWon { get; set; }
    public DateTime WonAt { get; set; }
}
