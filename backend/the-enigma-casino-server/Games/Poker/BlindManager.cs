using the_enigma_casino_server.Games.RevisarPoker;
using the_enigma_casino_server.Games.Shared.Entities;
using the_enigma_casino_server.Games.Shared.Entities.Enum;

public class BlindManager
{
    private readonly Match _gameMatch;
    private readonly PokerGameService _pokerGameService;
    private int _dealerIndex;

    // Constantes de valor de ciegas, se pueden reducir en un futuro
    private const int SmallBlindAmount = 10;
    private const int BigBlindAmount = 20;

    public BlindManager(Match gameMatch, PokerGameService pokerGameService)
    {
        _gameMatch = gameMatch;
        _pokerGameService = pokerGameService;
        _dealerIndex = 0;     // _dealerIndex guarda el índice del jugador que es el dealer en la ronda actual.
    }

    // Propiedad que devuelve al jugador que es el dealer en la ronda actual
    public Player Dealer => _gameMatch.Players[_dealerIndex % _gameMatch.Players.Count];

    // Propiedad que devuelve al jugador que es el small blind (el jugador a la izquierda del dealer).
    public Player SmallBlind => _gameMatch.Players[(_dealerIndex + 1) % _gameMatch.Players.Count];

    // Propiedad que devuelve al jugador que es el big blind (el jugador a la izquierda del small blind).
    public Player BigBlind => _gameMatch.Players[(_dealerIndex + 2) % _gameMatch.Players.Count];

    // Propiedad que devuelve el indice del primer jugador en actuar (despues de las ciegas).
    public int FirstToActIndex => (_dealerIndex + 3) % _gameMatch.Players.Count;

    // Propiedad que devuelve el índice del jugador que tiene que pagar la small blind.
    public int SmallBlindIndex => (_dealerIndex + 1) % _gameMatch.Players.Count;

    // Asigna las apuestas de las ciegas (small y big) 
    public void AssignBlinds()
    {
        var smallBlind = SmallBlind;
        var bigBlind = BigBlind;

        int smallBlindAmount = Math.Min(SmallBlindAmount, smallBlind.User.Coins);
        int bigBlindAmount = Math.Min(BigBlindAmount, bigBlind.User.Coins);

        if (smallBlindAmount > 0)
        {
            _pokerGameService.HandlePokerBet(smallBlind, smallBlindAmount);
            _pokerGameService.AddToPot(smallBlindAmount);
            Console.WriteLine($"{smallBlind.User.NickName} paga {smallBlindAmount} (Small Blind)");
        }
        else
        {
            smallBlind.PlayerState = PlayerState.Waiting;
            Console.WriteLine($"{smallBlind.User.NickName} no tiene fichas suficientes para la Small Blind y pasa a modo espera.");
        }

        if (bigBlindAmount > 0)
        {
            _pokerGameService.HandlePokerBet(bigBlind, bigBlindAmount);
            _pokerGameService.AddToPot(bigBlindAmount);
            Console.WriteLine($"{bigBlind.User.NickName} paga {bigBlindAmount} (Big Blind)");
        }
        else
        {
            bigBlind.PlayerState = PlayerState.Waiting;
            Console.WriteLine($"{bigBlind.User.NickName} no tiene fichas suficientes para la Big Blind y pasa a modo espera.");
        }

        Console.WriteLine($"\nDealer: {Dealer.User.NickName}");
    }

    // Cambia al siguiente jugador como dealer para la siguiente ronda
    public void NextDealer()
    {
        // Incrementa el indice del dealer y se asegura de que vuelva al principio si es el ultimo jugador.
        _dealerIndex = (_dealerIndex + 1) % _gameMatch.Players.Count;
    }
}
