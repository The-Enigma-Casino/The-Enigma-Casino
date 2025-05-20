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
                Image = "user_default.webp",
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
                Image = "user_default.webp",
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
                Image = "user_default.webp",
                Country = "ESP",
                Address = "Calle de pruebas",
                DateOfBirth = new DateTime(1990, 5, 17),
                Coins = 10000,
                IsSelfBanned = false,
                EmailConfirm = true,
                ConfirmationToken = null,
                Role = Role.User,
            },
            new User
        {
            NickName = "test1",
            FullName = "Test Uno",
            Email = "test1@example.com",
            HashPassword = HashHelper.Hash("test1"),
            Image = "user_default.webp",
            Country = "USA",
            Address = "123 Test Street",
            DateOfBirth = new DateTime(1988, 3, 10),
            Coins = 5000,
            IsSelfBanned = false,
            EmailConfirm = true,
            ConfirmationToken = null,
            Role = Role.User,
        },
        new User
        {
            NickName = "test2",
            FullName = "Test Dos",
            Email = "test2@example.com",
            HashPassword = HashHelper.Hash("test2"),
            Image = "user_default.webp",
            Country = "MEX",
            Address = "456 Test Avenue",
            DateOfBirth = new DateTime(1992, 7, 23),
            Coins = 8000,
            IsSelfBanned = false,
            EmailConfirm = true,
            ConfirmationToken = null,
            Role = Role.User,
        },
        new User
        {
            NickName = "test3",
            FullName = "Test Tres",
            Email = "test3@example.com",
            HashPassword = HashHelper.Hash("test3"),
            Image = "user_default.webp",
            Country = "ARG",
            Address = "789 Test Blvd",
            DateOfBirth = new DateTime(1995, 1, 5),
            Coins = 7500,
            IsSelfBanned = true,
            EmailConfirm = true,
            ConfirmationToken = "XYZ123TOKEN",
            Role = Role.User,
        },
        new User
        {
            NickName = "moderator",
            FullName = "Moderador Casino",
            Email = "moderator@example.com",
            HashPassword = HashHelper.Hash("moderator"),
            Image = "user_default.webp",
            Country = "ESP",
            Address = "Calle Moderador",
            DateOfBirth = new DateTime(1985, 9, 12),
            Coins = 12000,
            IsSelfBanned = false,
            EmailConfirm = true,
            ConfirmationToken = null,
            Role = Role.User,
        },
        new User
{
    NickName = "lucky",
    FullName = "Suerte Jugador",
    Email = "luckyplayer@example.com",
    HashPassword = HashHelper.Hash("lucky"),
    Image = "user_default.webp",
    Country = "COL",
    Address = "Calle Fortuna 77",
    DateOfBirth = new DateTime(1993, 11, 30),
    Coins = 15000,
    IsSelfBanned = false,
    EmailConfirm = true,
    ConfirmationToken = null,
    Role = Role.User,
},
new User
{
    NickName = "novato",
    FullName = "Jugador Novato",
    Email = "novato@example.com",
    HashPassword = HashHelper.Hash("novato"),
    Image = "user_default.webp",
    Country = "PER",
    Address = "Av. Inicios 123",
    DateOfBirth = new DateTime(2002, 2, 14),
    Coins = 3000,
    IsSelfBanned = false,
    EmailConfirm = false,
    ConfirmationToken = "TOKEN12345",
    Role = Role.User,
},
new User
{
    NickName = "vipmaster",
    FullName = "VIP Master",
    Email = "vipmaster@example.com",
    HashPassword = HashHelper.Hash("vipmaster"),
    Image = "user_default.webp",
    Country = "USA",
    Address = "High Roller Blvd",
    DateOfBirth = new DateTime(1980, 6, 9),
    Coins = 50000,
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
