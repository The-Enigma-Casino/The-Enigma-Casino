using BlackJackGame.Entities;
using BlackJackGame.Enum;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PokerGame.Entities
{
    public class EvaluatedHand
    {
        public Player Player { get; set; }
        public string Description { get; set; } = string.Empty;
        public int Strength { get; set; } // Fuerza ganadora del 1 al 9
        public CardRank HighCard { get; set; }
        public List<CardRank> RankList { get; set; } = new();
    }
}
