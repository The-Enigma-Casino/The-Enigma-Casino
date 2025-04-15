using the_enigma_casino_server.Application.Dtos;
using the_enigma_casino_server.Games.Shared.Entities;

namespace the_enigma_casino_server.Application.Mappers;

public class GameHistoryMapper
{
    public GamesDto ToGamesDto(History gameHistory)
    {
        return new GamesDto(gameHistory.Id, gameHistory.JoinedAt, gameHistory.GameType, gameHistory.ChipResult);
    }

    public List<GamesDto> ToListGamesDto(List<History> gameHistorys)
    {
        List<GamesDto> gamesDtos = new List<GamesDto>();

        foreach (History gameHistory in gameHistorys)
        {
            gamesDtos.Add(ToGamesDto(gameHistory));
        }

        return gamesDtos;
    }
}
