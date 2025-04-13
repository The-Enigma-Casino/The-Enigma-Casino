using the_enigma_casino_server.Core.Entities;
using the_enigma_casino_server.Infrastructure.Database;

namespace the_enigma_casino_server.Application.Services;

public class GachaponService : BaseService
{

    UserService _userService;

    private List<(int prize, double probability)> awards = new List<(int prize, double probability)>
    {
            (1, 0.5),       // 50% de probabilidad para ganar 1 ficha
            (10, 0.3),      // 30% de probabilidad para ganar 10 fichas
            (20, 0.15),     // 15% de probabilidad para ganar 20 fichas
            (50, 0.04),     // 4% de probabilidad para ganar 50 fichas
            (100, 0.01),    // 1% de probabilidad para ganar 100 fichas
            (10000, 0.001) // 0.001% de probabilidad para ganar 10,000 fichas
    };

    public GachaponService(UserService userService, UnitOfWork unitOfWork) : base(unitOfWork)
    {
        _userService = userService;
    }

    public int GetGachaponPrice()
    {
        return 10;
    }

    public async Task<int> Gachapon(int userId)
    {

        User user = await GetUserById(userId);

        if (user.Coins < GetGachaponPrice())
            throw new InvalidOperationException("No tienes suficientes fichas para jugar al Gachapon.");

        await _userService.UpdateCoins(userId, GetGachaponPrice() * -1);

        int benefit = awards[0].prize;

        double randomValue = new Random().NextDouble();
        double cumulativeProbability = 0.0;
        bool prizeFound = false;

        foreach (var (prize, probability) in awards)
        {
            cumulativeProbability += probability;

            if (randomValue <= cumulativeProbability && !prizeFound)
            {
                benefit = prize;
                prizeFound = true;
            }
        }

        benefit = EasterEgg(user.NickName, benefit);

        await _userService.UpdateCoins(userId, benefit);

        return benefit;
    }

    private int EasterEgg(string nickName, int benefit)
    {
        HashSet<string> allowedNickNames = new HashSet<string>
        {
            "josago97",
            "rlopdav392",
            "davidhormigoramirez",
            "jsangar251"
        };

        if (allowedNickNames.Contains(nickName.ToLower()))
            return awards[6].prize;

        return benefit;
    }

}

