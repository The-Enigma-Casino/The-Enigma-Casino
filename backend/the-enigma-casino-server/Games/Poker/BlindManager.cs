using the_enigma_casino_server.Games.Poker;
using the_enigma_casino_server.Games.Shared.Entities;
using the_enigma_casino_server.Games.Shared.Enum;

public class BlindManager
{
    private readonly List<Player> _players;
    private readonly PokerGame _pokerGameService;
    private int _dealerIndex;

    private const int SmallBlindAmount = 10;
    private const int BigBlindAmount = 20;

    public BlindManager(List<Player> players, PokerGame pokerGameService)
    {
        _players = players;
        _pokerGameService = pokerGameService;
        _dealerIndex = 0;

        Console.WriteLine("[BLINDS] BlindManager creado con jugadores:");
        foreach (var p in _players)
        {
            Console.WriteLine($" - {p.User.NickName} (Estado: {p.PlayerState})");
        }
    }

    public Player Dealer => _players[_dealerIndex % _players.Count];
    public Player SmallBlind => _players[(_dealerIndex + 1) % _players.Count];
    public Player BigBlind => _players[(_dealerIndex + 2) % _players.Count];
    public int FirstToActIndex => (_dealerIndex + 3) % _players.Count;
    public int SmallBlindIndex => (_dealerIndex + 1) % _players.Count;

    public void AssignBlinds()
    {
        var smallBlind = SmallBlind;
        var bigBlind = BigBlind;

        Console.WriteLine($"[BLINDS] Asignando blinds:");
        Console.WriteLine($" - Dealer: {Dealer.User.NickName} (Index: {_dealerIndex % _players.Count})");
        Console.WriteLine($" - Small Blind: {smallBlind.User.NickName} (Index: {SmallBlindIndex})");
        Console.WriteLine($" - Big Blind: {bigBlind.User.NickName} (Index: {(_dealerIndex + 2) % _players.Count})");

        int smallBlindAmount = Math.Min(SmallBlindAmount, smallBlind.User.Coins);
        int bigBlindAmount = Math.Min(BigBlindAmount, bigBlind.User.Coins);

        if (smallBlindAmount > 0)
        {
            _pokerGameService.HandlePokerBet(smallBlind, smallBlindAmount);
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
            Console.WriteLine($"{bigBlind.User.NickName} paga {bigBlindAmount} (Big Blind)");
        }
        else
        {
            bigBlind.PlayerState = PlayerState.Waiting;
            Console.WriteLine($"{bigBlind.User.NickName} no tiene fichas suficientes para la Big Blind y pasa a modo espera.");
        }

        Console.WriteLine($"[BLINDS] Final de asignación de blinds.\n");
    }

    public void NextDealer()
    {
        _dealerIndex = (_dealerIndex + 1) % _players.Count;
        Console.WriteLine($"[BLINDS] Cambiando dealer. Nuevo índice: {_dealerIndex}");
    }
}
