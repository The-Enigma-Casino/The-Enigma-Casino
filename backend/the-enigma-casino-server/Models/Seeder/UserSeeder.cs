using the_enigma_casino_server.Models.Database;
using the_enigma_casino_server.Models.Database.Entities;
using the_enigma_casino_server.Models.Database.Entities.Enum;
using the_enigma_casino_server.Utilities;

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
                HashPassword = HashHelper.Hash("admin"),
                Image = "default.png",
                Country = "ESP",
                Address = "admin",
                DateOfBirth = new DateTime(1990, 5, 15),
                Coins = 0,
                IsBanned = false,
                EmailConfirm = true, 
                ConfirmationToken = null,
                Role = Role.Admin,
            },
        };

        _context.Users.AddRange(users);
        _context.SaveChanges();
    }
}
