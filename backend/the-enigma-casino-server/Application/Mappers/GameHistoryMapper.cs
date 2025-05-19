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

    public BigWinDto ToBigWinDto(History gameHistory)
    {
        return new BigWinDto
        {
            Nickname = gameHistory.User.NickName,
            GameType = gameHistory.GameType,
            AmountWon = gameHistory.ChipResult,
            WonAt = gameHistory.LeftAt ?? gameHistory.JoinedAt
        };
    }

    public List<BigWinDto> ToListBigWinDto(List<History> gameHistorys)
    {
        List<BigWinDto> bigWinDtos = new List<BigWinDto>();

        foreach (History gameHistory in gameHistorys)
        {
            bigWinDtos.Add(ToBigWinDto(gameHistory));
        }

        return bigWinDtos;
    }
}
