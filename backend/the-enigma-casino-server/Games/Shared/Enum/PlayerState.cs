namespace the_enigma_casino_server.Games.Shared.Enum;

public enum PlayerState
{
    Waiting,
    Playing,
    Stand,
    Spectating,
    Bust,
    Win,
    Lose,
    Draw,
    Left,
    Blackjack, // Jugada de BlackJack
    Fold, // Retirarse poker
    AllIn // AllIn poker
}