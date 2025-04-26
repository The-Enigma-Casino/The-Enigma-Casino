namespace the_enigma_casino_server.Application.Dtos.Request;

public class UpdateCoinsPackRequest
{
    public int Id { get; set; }
    public int Price { get; set; }
    public int Quantity { get; set; }
    public int Offer { get; set; }
    public IFormFile? ImageFile { get; set; }

}
