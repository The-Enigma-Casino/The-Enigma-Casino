using the_enigma_casino_server.Core.Entities;

namespace the_enigma_casino_server.Infrastructure.Database.Seeder;

public class UserFriendSeeder
{
    private readonly MyDbContext _context;

    public UserFriendSeeder(MyDbContext context)
    {
        _context = context;
    }

    public void Seed()
    {
        var user1 = _context.Users.FirstOrDefault(u => u.NickName == "admin");
        var user2 = _context.Users.FirstOrDefault(u => u.NickName == "user");

        if (user1 == null || user2 == null)
        {
            Console.WriteLine("Usuarios no encontrados. Ejecutá el UserSeeder primero.");
            return;
        }

        // Verificamos si ya existe la amistad
        bool alreadyFriends = _context.UserFriends.Any(f =>
            (f.UserId == user1.Id && f.FriendId == user2.Id) ||
            (f.UserId == user2.Id && f.FriendId == user1.Id));

        if (alreadyFriends)
        {
            Console.WriteLine("Ya son amigos, no se insertará duplicado.");
            return;
        }

        _context.UserFriends.AddRange(
            new UserFriend { UserId = user1.Id, FriendId = user2.Id },
            new UserFriend { UserId = user2.Id, FriendId = user1.Id } // opcional para bidireccional
        );

        _context.SaveChanges();

        Console.WriteLine($"Amistad creada entre {user1.NickName} y {user2.NickName}");
    }
}
