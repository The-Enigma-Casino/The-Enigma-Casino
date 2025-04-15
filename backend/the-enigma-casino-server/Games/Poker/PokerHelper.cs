using the_enigma_casino_server.Games.Shared.Entities;

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
}
