using the_enigma_casino_server.Games.Shared.Entities.Enum;

namespace the_enigma_casino_server.Models.Dtos;

public class GamesDto
{
    public int Id { get; set; }

    public DateTime JoinedAt { get; set; }

    public GameType GameType { get; set; }

    public int ChipResult { get; set; }

    public GamesDto(int id, DateTime joinedAt, GameType gameType, int chipResult)
    {
        Id = id;
        JoinedAt = joinedAt;
        GameType = gameType;
        ChipResult = chipResult;
    }
}
