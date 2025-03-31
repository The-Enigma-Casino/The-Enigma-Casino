namespace the_enigma_casino_server.Models.Dtos;

public class HistoryDto
{
    public List<GamesDto> GamesDtos { get; set; }

    public int TotalPages { get; set; }

    public HistoryDto(List<GamesDto> gamesDtos, int pages)
    {
        GamesDtos = gamesDtos;
        TotalPages = pages;
    }
}
