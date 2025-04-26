using the_enigma_casino_server.Games.Shared.Entities;
using the_enigma_casino_server.Games.Shared.Enum;

namespace the_enigma_casino_server.Games.Poker;

public class PokerHelper
{
    public static void ShowCommunityCards(List<Card> communityCards)
    {
        Console.WriteLine("Cartas comunitarias:");
        foreach (var card in communityCards)
        {
            Console.WriteLine(card);
        }
    }

    public static bool OnlyOnePlayerLeft(List<Player> players)
    {
        return players.Count(p => p.PlayerState == PlayerState.Playing || p.PlayerState == PlayerState.AllIn) == 1;
    }

    public static bool AllPlayersAllInOrNoChips(List<Player> players)
    {
        return players
            .Where(p => p.PlayerState == PlayerState.Playing)
            .All(p => p.User.Coins == 0 || p.PlayerState == PlayerState.AllIn);
    }
}