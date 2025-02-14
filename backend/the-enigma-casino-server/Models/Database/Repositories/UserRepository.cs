using Microsoft.EntityFrameworkCore;
using the_enigma_casino_server.Models.Database.Entities;
using the_enigma_casino_server.Utilities;

namespace the_enigma_casino_server.Models.Database.Repositories;

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
        string hashPassword = HashHelper.Hash(password);
        identifier = identifier.ToLower();

        return await GetQueryable()
            .FirstOrDefaultAsync(user => (user.Email == identifier || user.NickName.ToLower() == identifier) && user.HashPassword == hashPassword);
    }


    public async Task<bool> ExistEmail(string email)
    {
        email = email.ToLower();
        User user = await GetQueryable().FirstOrDefaultAsync(user => user.Email == email);
        if (user == null)
        {
            return false;
        }
        return true;
    }

    public async Task<bool> ExistHashDNI(string hashDNI)
    {
        hashDNI = hashDNI.ToLower();
        User user = await GetQueryable().FirstOrDefaultAsync(user => user.HashDNI == hashDNI);
        if (user == null)
        {
            return false;
        }
        return true;
    }

    public async Task<bool> ExistNickName(string nickName)
    {
        nickName = nickName.ToLower();
        User user = await GetQueryable().FirstOrDefaultAsync(user => user.NickName == nickName);
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

}
