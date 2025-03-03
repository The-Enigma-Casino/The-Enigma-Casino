using Stripe.Checkout;
using the_enigma_casino_server.Models.Database.Entities;

namespace the_enigma_casino_server.Models.Mappers;

public class StripeMapper
{
    public SessionLineItemOptions ToSessionLineItemOptions(CoinsPack coinsPack)
    {
        SessionLineItemOptions sessionLineItemOptions = new SessionLineItemOptions()
        {
            PriceData = new SessionLineItemPriceDataOptions()
            {
                Currency = "eur",
                UnitAmount = coinsPack.Price,
                ProductData = new SessionLineItemPriceDataProductDataOptions()
                {
                    Name = coinsPack.Quantity.ToString() + " fichas.",
                    Description = "Pack de " + coinsPack.Quantity.ToString() + " fichas.",
                    Images = [coinsPack.Image]
                }
            },
            Quantity = 1,
        };

        return sessionLineItemOptions;
    }
}
