using the_enigma_casino_server.Games.BlackJack.Repository;
using the_enigma_casino_server.Games.Repository;
using the_enigma_casino_server.Models.Database.Repositories;

namespace the_enigma_casino_server.Models.Database;

public class UnitOfWork
{
    private readonly MyDbContext _context;

    private UserRepository _userRepository;
    private CoinsPackRepository _coinsPackRepository;
    private OrderRepository _orderRepository;
    private CardRepository _cardRepository;
    private DeckRepository _deckRepository;

    public UserRepository UserRepository => _userRepository ??= new UserRepository(_context);
    public CoinsPackRepository CoinsPackRepository => _coinsPackRepository ??= new CoinsPackRepository(_context);
    public OrderRepository OrderRepository => _orderRepository ??= new OrderRepository(_context);
    public CardRepository CardRepository => _cardRepository ??= new CardRepository(_context);
    public DeckRepository DeckRepository => _deckRepository ??= new DeckRepository(_context);

    public UnitOfWork(MyDbContext myDbContext)
    {
        _context = myDbContext;
    }

    public async Task<bool> SaveAsync()
    {
        return await _context.SaveChangesAsync() > 0;
    }
}
