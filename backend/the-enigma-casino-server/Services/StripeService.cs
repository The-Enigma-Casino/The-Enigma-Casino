using Stripe.Checkout;
using the_enigma_casino_server.Models.Database;
using the_enigma_casino_server.Models.Database.Entities;
using the_enigma_casino_server.Models.Mappers;

namespace the_enigma_casino_server.Services;

public class StripeService : BaseService
{

    private readonly StripeMapper _stripeMapper;

    private readonly OrderService _orderService;

    public StripeService(UnitOfWork unitOfWork, StripeMapper stripeMapper, OrderService orderService) : base(unitOfWork)
    {
        _stripeMapper = stripeMapper;
        _orderService = orderService;
    }

    public async Task<SessionCreateOptions> EmbededCheckout(int userId, int coinsPackId)
    {
        User user = await GetUserById(userId);

        CoinsPack coinsPack = await _unitOfWork.CoinsPackRepository.GetByIdAsync(coinsPackId);

        if (coinsPack == null)
        {
            throw new KeyNotFoundException($"No hay pack de monedas con este ID {coinsPack.Id}");
        }

        SessionLineItemOptions item = _stripeMapper.ToSessionLineItemOptions(coinsPack);

        SessionCreateOptions options = new SessionCreateOptions
        {
            UiMode = "embedded",
            Mode = "payment",
            PaymentMethodTypes = ["card"],
            LineItems = new List<SessionLineItemOptions> { item },
            CustomerEmail = user.Email,
            RedirectOnCompletion = "never"
        };

        return options;
    }

    public async Task<Session> GetSessionAsync(string sessionId)
    {
        try
        {
            SessionService sessionService = new SessionService();
            return await sessionService.GetAsync(sessionId);
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException($"Error al obtener la sesión de Stripe con ID {sessionId}.", ex);
        }
    }

    public async Task<Session> SessionStatus(string sessionId)
    {
        SessionService sessionService = new SessionService();
        Session session = await sessionService.GetAsync(sessionId);

        return session;
    }

    public async Task<string> GetPaymentStatus(string sessionId)
    {
        Session session = await GetSessionAsync(sessionId);

        return session.PaymentStatus;
    }

}
