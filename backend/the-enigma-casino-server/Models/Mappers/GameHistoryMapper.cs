using the_enigma_casino_server.Games.Shared.Entities;
using the_enigma_casino_server.Models.Dtos;

namespace the_enigma_casino_server.Models.Mappers;

public class GameHistoryMapper
{
    public GamesDto ToGamesDto(GameHistory gameHistory)
    {
        return new GamesDto(gameHistory.Id, gameHistory.JoinedAt, gameHistory.GameType, gameHistory.ChipResult);
    }

    public List<GamesDto> ToListGamesDto(List<GameHistory> gameHistorys)
    {
        List<GamesDto> gamesDtos = new List<GamesDto>();

        foreach (GameHistory gameHistory in gameHistorys)
        {
            gamesDtos.Add(ToGamesDto(gameHistory));
        }

        return gamesDtos;
    }
}
