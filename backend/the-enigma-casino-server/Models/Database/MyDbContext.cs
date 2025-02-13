using Microsoft.EntityFrameworkCore;

namespace the_enigma_casino_server.Models.Database;

public class MyDbContext : DbContext
{\
    private const string DATABASE_PATH = "enigmacasino.db";
    protected override void OnConfiguring(DbContextOptionsBuilder options)
    {
        //AppDomain obtiene el directorio donde se ejecuta la aplicación
        string baseDir = AppDomain.CurrentDomain.BaseDirectory;

        // Se configura Sqlite como proveedor de BD pasando la ruta de archivo ("vhypergames.db) en el directorio base de la aplicacion
#if DEBUG
        options.UseSqlite($"DataSource={baseDir}{DATABASE_PATH}");
#elif RELEASE
        options.UseMySql(Environment.GetEnvironmentVariable("DB_CONFIG"), ServerVersion.AutoDetect(Environment.GetEnvironmentVariable("DB_CONFIG")));
#endif
    }
}
