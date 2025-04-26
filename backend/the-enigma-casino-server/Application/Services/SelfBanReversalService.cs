
using the_enigma_casino_server.Core.Entities;
using the_enigma_casino_server.Infrastructure.Database;

namespace the_enigma_casino_server.Application.Services;

public class SelfBanReversalService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;

    public SelfBanReversalService(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            await Task.Delay(TimeSpan.FromHours(24), stoppingToken);

            using IServiceScope scope = _serviceProvider.CreateScope();
            UnitOfWork unitOfWork = scope.ServiceProvider.GetRequiredService<UnitOfWork>();

            List<User> bannedUsers = await unitOfWork.UserRepository.GetUsersEligibleForSelfBanReversalAsync();

            foreach (User user in bannedUsers)
            {
                user.IsSelfBanned = false;
                user.SelfBannedAt = null;
                unitOfWork.UserRepository.Update(user);
            }

            await unitOfWork.SaveAsync();
        }
    }
}
