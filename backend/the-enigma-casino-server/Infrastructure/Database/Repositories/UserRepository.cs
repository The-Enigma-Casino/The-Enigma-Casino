using Microsoft.EntityFrameworkCore;
using the_enigma_casino_server.Application.Dtos;
using the_enigma_casino_server.Core.Entities;
using the_enigma_casino_server.Infrastructure.Database;
using the_enigma_casino_server.Utilities;

namespace the_enigma_casino_server.Infrastructure.Database.Repositories;

public class UserRepository : Repository<User, int>
{
    public UserRepository(MyDbContext context) : base(context)
    {

    }

    public async Task<User> UserValidate(string identifier, string password)
    {
        if (identifier == null || password == null)
        {
            return null;
        }

        return await GetDataRegister(identifier, password);

    }


    public async Task<User> GetDataRegister(string identifier, string password)
    {
        identifier = identifier.ToLower();

        User user = await GetQueryable()
            .FirstOrDefaultAsync(user =>
                user.Email.ToLower() == identifier || user.NickName.ToLower() == identifier);

        if (user == null) return null;

        string hashPassword = HashHelper.Hash(password);
        if (user.HashPassword != hashPassword) return new User { Id = -1 };

        return user;
    }


    public async Task<bool> ExistEmail(string email)
    {
        email = email.ToLower();
        User user = await GetQueryable().FirstOrDefaultAsync(user => user.Email.ToLower() == email);
        if (user == null)
        {
            return false;
        }
        return true;
    }

    public async Task<bool> ExistNickName(string nickName)
    {
        nickName = nickName.ToLower();
        User user = await GetQueryable().FirstOrDefaultAsync(user => user.NickName.ToLower() == nickName);
        if (user == null)
        {
            return false;
        }
        return true;
    }

    public async Task<List<User>> GetAllUserAsync()
    {
        return await GetQueryable().ToListAsync();
    }

    public async Task<User> GetUserById(int id)
    {
        return await Context.Set<User>()
            .FirstOrDefaultAsync(u => u.Id == id);
    }

    public async Task<List<string>> GetAllNickNames()
    {
        ICollection<User> users = await GetAllAsync();

        List<string> nickNames = users.Select(u => u.NickName).ToList();

        return nickNames;
    }

    public async Task<User> GetUserByConfirmationTokenAsync(string token)
    {
        if (string.IsNullOrEmpty(token))
            return null;

        return await GetQueryable()
            .FirstOrDefaultAsync(u => u.ConfirmationToken == token);
    }

    public async Task<List<User>> GetUsersEligibleForSelfBanReversalAsync()
    {
        DateTime thresholdDate = DateTime.UtcNow.AddDays(-15);

        return await GetQueryable()
            .Where(u => u.IsSelfBanned && u.SelfBannedAt != null && u.SelfBannedAt <= thresholdDate)
            .ToListAsync();
    }


    public async Task<List<User>> GetByNickNamesAsync(List<string> nickNames)
    {
        return await GetQueryable()
            .Where(u => nickNames.Contains(u.NickName))
            .ToListAsync();
    }
    public async Task<List<FriendDto>> SearchAddableUsersAsync(string query, int currentUserId, List<int> excludedIds)
    {
        var lowerQuery = query.ToLower();

        var candidates = await GetQueryable()
            .Where(u =>
                u.Id != currentUserId &&
                u.NickName.ToLower().Contains(lowerQuery)
            )
            .Select(u => new FriendDto
            {
                Id = u.Id,
                NickName = u.NickName,
                Image = u.Image
            })
            .Take(20)
            .ToListAsync();

        Console.WriteLine("[DEBUG] Usuarios candidatos: " + string.Join(", ", candidates.Select(c => $"{c.Id} - {c.NickName}")));

        var excludedSet = new HashSet<int>(excludedIds);
        var result = candidates.Where(u => !excludedSet.Contains(u.Id)).ToList();

        Console.WriteLine("[DEBUG] Usuarios después del filtro: " + string.Join(", ", result.Select(r => $"{r.Id} - {r.NickName}")));

        return result;
    }



}
