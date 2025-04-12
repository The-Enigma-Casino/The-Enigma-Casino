using BlackJackGame.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PokerGame.Entities;

public class Pot
{
    public int Amount { get; set; } = 0;

    public List<Player> EligiblePlayers { get; set; } = new(); // Participantes en el bote

    public Pot() { }

    public Pot(List<Player> players)
    {
        EligiblePlayers = new List<Player>(players);
    }

    public void AddChips(int chips)
    {
        Amount += chips;
    }

    public void AddEligiblePlayer(Player player)
    {
        if (!EligiblePlayers.Contains(player))
        {
            EligiblePlayers.Add(player);
        }
    }

    public override string ToString()
    {
        return $"Pot: {Amount} chips | Jugadores en el bote: {string.Join(", ", EligiblePlayers.Select(p => p.User.NickName))}";
    }
}
