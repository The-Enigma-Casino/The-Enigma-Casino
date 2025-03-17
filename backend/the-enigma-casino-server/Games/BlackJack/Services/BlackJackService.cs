using the_enigma_casino_server.Games.BlackJack.Entities;

namespace the_enigma_casino_server.Games.BlackJack.Services;

public class BlackJackService
{
    public DeckService DeckService { get; set; }

    public BlackJackService(DeckService deckService)
    {
        DeckService = deckService;
    }

    public void StartGame()
    {
        Deck deck = new Deck();
        DeckService.Shuffle(deck);

        //Player player = new Player();
        //Dealer dealer = new Dealer();

        //player.Hand.Add(DeckService.DrawCard(deck));
        //player.Hand.Add(DeckService.DrawCard(deck));

        //dealer.Hand.Add(DeckService.DrawCard(deck));
        //dealer.Hand.Add(DeckService.DrawCard(deck));

        //player.Score = CalculateScore(player.Hand);
        //dealer.Score = CalculateScore(dealer.Hand);
    }
}
