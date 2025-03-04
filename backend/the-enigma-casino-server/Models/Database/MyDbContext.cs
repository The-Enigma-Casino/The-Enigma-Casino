using Microsoft.EntityFrameworkCore;
using the_enigma_casino_server.Models.Database.Entities;

namespace the_enigma_casino_server.Models.Database;

public class MyDbContext : DbContext
{
    private const string DATABASE_PATH = "enigmacasino.db";


    public MyDbContext() { }

    public MyDbContext(DbContextOptions<MyDbContext> options) : base(options) { }

    public DbSet<User> Users { get; set; }
    public DbSet<CoinsPack> CoinsPacks { get; set; }
    public DbSet<Order> Orders { get; set; }

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
