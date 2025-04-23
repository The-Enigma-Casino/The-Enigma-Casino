using Microsoft.EntityFrameworkCore;
using the_enigma_casino_server.Core.Entities;
using the_enigma_casino_server.Games.Shared.Entities;

namespace the_enigma_casino_server.Infrastructure.Database;

public class MyDbContext : DbContext
{
    private const string DATABASE_PATH = "enigmacasino.db";


    public MyDbContext() { }

    public MyDbContext(DbContextOptions<MyDbContext> options) : base(options) { }

    public DbSet<User> Users { get; set; }
    public DbSet<CoinsPack> CoinsPacks { get; set; }
    public DbSet<Order> Orders { get; set; }
    public DbSet<Table> GameTables { get; set; }
    public DbSet<History> GameHistory { get; set; }
    public DbSet<UserFriend> UserFriends { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder options)
    {
        string baseDir = AppDomain.CurrentDomain.BaseDirectory;

#if DEBUG
        options.UseSqlite($"DataSource={baseDir}{DATABASE_PATH}");
#elif RELEASE
        options.UseMySql(Environment.GetEnvironmentVariable("DB_CONFIG"), ServerVersion.AutoDetect(Environment.GetEnvironmentVariable("DB_CONFIG")));
#endif
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(MyDbContext).Assembly);
    }

}
