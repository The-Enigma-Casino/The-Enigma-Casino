using the_enigma_casino_server.Games.Shared.Enum;

namespace the_enigma_casino_server.Games.Shared.Entities
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
