using the_enigma_casino_server.Application.Dtos;
using the_enigma_casino_server.Core.Entities;
using the_enigma_casino_server.Infrastructure.Database;

namespace the_enigma_casino_server.Application.Services;

public class GachaponService : BaseService
{

    private readonly UserService _userService;

    private readonly RandomService _randomService;

    private List<(int prize, double probability)> awards = new List<(int prize, double probability)>
    {
        (1, 0.75),
        (10, 0.15),
        (20, 0.05),
        (50, 0.028),
        (100, 0.009),
        (666, 0.003)
    };

    private const int GrandPrize = 10000;


    public GachaponService(UserService userService, RandomService randomService, UnitOfWork unitOfWork) : base(unitOfWork)
    {
        _userService = userService;
        _randomService = randomService;
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

        await _userService.UpdateCoins(userId, GetGachaponPrice() * -1);

        int benefit = awards[0].prize;

        double randomValue = _randomService.NextDouble();
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
        "josago97", "rlopdav392", "davidhormigoramirez", "jsangar251", "roro"
    };

        return allowedNickNames.Contains(nickName.ToLower());
    }
}
