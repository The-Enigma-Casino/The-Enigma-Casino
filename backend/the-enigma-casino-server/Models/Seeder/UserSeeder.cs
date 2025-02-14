using the_enigma_casino_server.Models.Database;
using the_enigma_casino_server.Models.Database.Entities;
using the_enigma_casino_server.Models.Database.Entities.Enum;

namespace the_enigma_casino_server.Models.Seeder;

public class UserSeeder
{
    private readonly MyDbContext _context;

    public UserSeeder(MyDbContext context)
    {
        _context = context;
    }

    public void Seed()
    {
        if (_context.Users.Any())
        {
            Console.WriteLine("Usuarios ya existen en la base de datos, no se insertarán duplicados.");
            return;
        }

        var users = new List<User>
        {
            new User
            {
                NickName = "admin",
                FullName = "admin",
                Email = "theenigmacasino@gmail.com",
                HashPassword = "admin",
                Image = "default.png",
                HashDNI = "admin",
                Country = "ESP",
                Address = "admin",
                Coins = 0,
                IsBanned = false,
                Role = Role.Admin,
            },
        };

        _context.Users.AddRange(users);
        _context.SaveChanges();
    }
}
