using Stripe.Checkout;
using the_enigma_casino_server.Core.Entities;

namespace the_enigma_casino_server.Application.Mappers;

public class StripeMapper
{
    public SessionLineItemOptions ToSessionLineItemOptions(CoinsPack coinsPack)
    {
        int unitAmount = coinsPack.Price;

        if (coinsPack.Offer > 0)
            unitAmount = coinsPack.Offer;

        SessionLineItemOptions sessionLineItemOptions = new SessionLineItemOptions()
        {
            PriceData = new SessionLineItemPriceDataOptions()
            {
                Currency = "eur",
                UnitAmount = unitAmount,
                ProductData = new SessionLineItemPriceDataProductDataOptions()
                {
                    Name = "Pack de " + coinsPack.Quantity + " fichas",
                    Images = [coinsPack.Image]
                }
            },
            Quantity = 1,
        };

        return sessionLineItemOptions;
    }
}
