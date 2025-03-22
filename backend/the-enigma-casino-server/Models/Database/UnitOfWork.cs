using the_enigma_casino_server.Games.Shared.Repository;
using the_enigma_casino_server.Models.Database.Repositories;

namespace the_enigma_casino_server.Models.Database;

public class UnitOfWork
{
    private readonly MyDbContext _context;

    private UserRepository _userRepository;
    private CoinsPackRepository _coinsPackRepository;
    private OrderRepository _orderRepository;
    private GameSessionRepository _gameSessionRepository;
    private GameMatchRepository _gameMatchRepository;

    public UserRepository UserRepository => _userRepository ??= new UserRepository(_context);
    public CoinsPackRepository CoinsPackRepository => _coinsPackRepository ??= new CoinsPackRepository(_context);
    public OrderRepository OrderRepository => _orderRepository ??= new OrderRepository(_context);
    public GameSessionRepository GameSessionRepository => _gameSessionRepository ??= new GameSessionRepository(_context);
    public GameMatchRepository GameMatchRepository => _gameMatchRepository ??= new GameMatchRepository(_context);

    public UnitOfWork(MyDbContext myDbContext)
    {
        _context = myDbContext;
    }

    public async Task<bool> SaveAsync()
    {
        return await _context.SaveChangesAsync() > 0;
    }
}
