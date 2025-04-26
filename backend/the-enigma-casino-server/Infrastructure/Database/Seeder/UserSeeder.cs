using the_enigma_casino_server.Application.Services;
using the_enigma_casino_server.Core.Entities;
using the_enigma_casino_server.Core.Entities.Enum;
using the_enigma_casino_server.Infrastructure.Database;
using the_enigma_casino_server.Utilities;

namespace the_enigma_casino_server.Infrastructure.Database.Seeder;

public class UserSeeder
{
    private readonly MyDbContext _context;

    private readonly UserService _userService;

    public UserSeeder(MyDbContext context, UserService userService)
    {
        _context = context;
        _userService = userService;
    }

    public void Seed()
    {
        if (_context.Users.Any())
        {
            Console.WriteLine("Usuarios ya existen en la base de datos, no se insertarán duplicados.");
            return;
        }

        List<User> users = new List<User>
        {
            new User
            {
                NickName = "admin",
                FullName = "admin",
                Email = "theenigmacasino@gmail.com",
                HashPassword = HashHelper.Hash("admin"),
                Image = "user_default.png",
                Country = "ESP",
                Address = "admin",
                DateOfBirth = new DateTime(1990, 5, 15),
                Coins = 10000,
                IsSelfBanned = false,
                EmailConfirm = true,
                ConfirmationToken = null,
                Role = Role.Admin,
            },
            new User
            {
                NickName = "user",
                FullName = "user",
                Email = "user@gmail.com",
                HashPassword = HashHelper.Hash("user"),
                Image = "user_default.png",
                Country = "ESP",
                Address = "Calle de usuarios",
                DateOfBirth = new DateTime(1990, 5, 16),
                Coins = 10000,
                IsSelfBanned = false,
                EmailConfirm = true,
                ConfirmationToken = null,
                Role = Role.User,
            },
            new User
            {
                NickName = "prueba",
                FullName = "prueba",
                Email = "prueba@gmail.com",
                HashPassword = HashHelper.Hash("prueba"),
                Image = "user_default.png",
                Country = "ESP",
                Address = "Calle de pruebas",
                DateOfBirth = new DateTime(1990, 5, 17),
                Coins = 10000,
                IsSelfBanned = false,
                EmailConfirm = true,
                ConfirmationToken = null,
                Role = Role.User,
            },
        };

        _context.Users.AddRange(users);
        _context.SaveChanges();

        User user = _context.Users.First(u => u.NickName == "user");

        string imagePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images", "pruebas", "zorrito_buho.jpg");
        FormFile imageFile = new FormFile(new FileStream(imagePath, FileMode.Open), 0, new FileInfo(imagePath).Length, "file", "zorrito_buho.jpg");

        _userService.UpdateUserImageAsync(user.Id, imageFile).Wait();
    }
}
