using the_enigma_casino_server.Games.Shared.Enum;
using the_enigma_casino_server.WebSockets.BlackJack;

namespace the_enigma_casino_server.WebSockets.Resolvers
{
    public class GameJoinHelperResolver
    {
        private readonly IServiceProvider _serviceProvider;

        public GameJoinHelperResolver(IServiceProvider serviceProvider)
        {
            _serviceProvider = serviceProvider;
        }

        public BlackjackJoinHelper Resolve(GameType gameType)
        {
            return gameType switch
            {
                GameType.BlackJack => _serviceProvider.GetRequiredService<BlackjackJoinHelper>(),
                _ => null
            };
        }
    }
}
