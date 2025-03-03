namespace the_enigma_casino_server.Models.Database.Entities;

public class CoinsPack
{
    public int Id { get; set; }
    public int Price { get; set; }  // Price in cents
    public int Quantity { get; set; }
    public int Offer { get; set; }
    public string Image { get; set; }

    public CoinsPack()
    {
        Price = 0;
        Quantity = 0;
        Offer = 0;
    }

}
