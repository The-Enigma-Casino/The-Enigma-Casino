using the_enigma_casino_server.Models.Database;
using the_enigma_casino_server.Models.Database.Entities;
using the_enigma_casino_server.NUEVOS;

namespace the_enigma_casino_server.Services;

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

    private const int GrandPrize = 10000;


    public GachaponService(UserService userService, UnitOfWork unitOfWork) : base(unitOfWork)
    {
        _userService = userService;
    }

    public int GetGachaponPrice()
    {
        return 10;
    }

    public async Task<GachaponResultDto> Gachapon(int userId)
    {
        User user = await GetUserById(userId);

        if (user.Coins < GetGachaponPrice())
            throw new InvalidOperationException("No tienes suficientes fichas para jugar al Gachapon.");

        await _userService.UpdateCoins(userId, (GetGachaponPrice() * -1));

        int benefit = awards[0].prize;

        double randomValue = new Random().NextDouble();
        double cumulativeProbability = 0.0;

        foreach (var (prize, probability) in awards)
        {
            cumulativeProbability += probability;

            if (randomValue <= cumulativeProbability)
            {
                benefit = prize;
                break;
            }
        }

        string? specialMessage = null;

        string nick = user.NickName.ToLower();

        if (IsTeacher(nick))
        {
            benefit = GrandPrize;
            specialMessage = "¡El aula ha sido bendecida con 10.000 fichas! La suerte del maestro nunca falla.";
        }
        else if (nick == "admin")
        {
            benefit = GrandPrize;
            specialMessage = "El código ha bendecido a su creador. 10.000 fichas para ti.";
        }

        await _userService.UpdateCoins(userId, benefit);

        return new GachaponResultDto
        {
            Benefit = benefit,
            SpecialMessage = specialMessage
        };
    }

    private bool IsTeacher(string nickName)
    {
        HashSet<string> allowedNickNames = new()
    {
        "josago97", "rlopdav392", "davidhormigoramirez", "jsangar251"
    };

        return allowedNickNames.Contains(nickName.ToLower());
    }
}
