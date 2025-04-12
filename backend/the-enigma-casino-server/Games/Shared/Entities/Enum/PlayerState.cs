namespace the_enigma_casino_server.Games.Shared.Entities.Enum;

public enum PlayerState
{
    Waiting,
    Playing,
    Stand,
    Bust,
    Win,
    Lose,
    Draw,
    Left,
    Fold, // Retirarse poker
    AllIn // AllIn poker
}