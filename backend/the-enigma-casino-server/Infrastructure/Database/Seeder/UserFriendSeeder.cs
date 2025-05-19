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
        var admin = _context.Users.FirstOrDefault(u => u.NickName == "admin");

        if (admin == null)
        {
            Console.WriteLine("Usuario 'admin' no encontrado. Ejecutá el UserSeeder primero.");
            return;
        }

        var allOtherUsers = _context.Users
            .Where(u => u.NickName != "admin")
            .ToList();

        foreach (var otherUser in allOtherUsers)
        {
            bool alreadyFriends = _context.UserFriends.Any(f =>
                (f.UserId == admin.Id && f.FriendId == otherUser.Id) ||
                (f.UserId == otherUser.Id && f.FriendId == admin.Id));

            if (!alreadyFriends)
            {
                _context.UserFriends.AddRange(
                    new UserFriend { UserId = admin.Id, FriendId = otherUser.Id },
                    new UserFriend { UserId = otherUser.Id, FriendId = admin.Id }
                );

                Console.WriteLine($"Amistad creada entre {admin.NickName} y {otherUser.NickName}");
            }
            else
            {
                Console.WriteLine($"{admin.NickName} y {otherUser.NickName} ya son amigos.");
            }
        }

        _context.SaveChanges();
    }
}
