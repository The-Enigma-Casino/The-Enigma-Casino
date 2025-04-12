using BlackJackGame.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PokerGame.Helper;

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
