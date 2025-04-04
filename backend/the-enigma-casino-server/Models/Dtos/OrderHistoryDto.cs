namespace the_enigma_casino_server.Models.Dtos;

public class OrderHistoryDto
{
    public List<OrderHistoryItemDto> Orders { get; set; }

    public int TotalPages { get; set; }

    public int Page { get; set; }

    public OrderHistoryDto(List<OrderHistoryItemDto> orders, int totalPages, int page)
    {
        Orders = orders;
        TotalPages = totalPages;
        Page = page;
    }
}
