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

    public BlindManager(List<Player> players, PokerGame pokerGameService, int dealerUserId)
    {
        _players = players;
        _pokerGameService = pokerGameService;
        _dealerIndex = _players.FindIndex(p => p.UserId == dealerUserId);

        if (_dealerIndex == -1)
            _dealerIndex = 0;
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

        int smallBlindAmount = Math.Min(SmallBlindAmount, smallBlind.User.Coins);
        int bigBlindAmount = Math.Min(BigBlindAmount, bigBlind.User.Coins);

        if (smallBlindAmount > 0)
        {
            _pokerGameService.HandlePokerBet(smallBlind, smallBlindAmount);
        }
        else
        {
            smallBlind.PlayerState = PlayerState.Waiting;
        }

        if (bigBlindAmount > 0)
        {
            _pokerGameService.HandlePokerBet(bigBlind, bigBlindAmount);
        }
        else
        {
            bigBlind.PlayerState = PlayerState.Waiting;
        }

    }

    public void NextDealer()
    {
        _dealerIndex = (_dealerIndex + 1) % _players.Count;
    }
}
