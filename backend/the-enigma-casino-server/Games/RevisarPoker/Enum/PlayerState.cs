
namespace BlackJackGame.Enum;

public enum PlayerState
{
    Waiting, // esperando cuano no se inicio el match
    Playing, // jugando
    Stand, // plantado
    Bust, // perdio por pasarse
    Win, // gano
    Lose, // perdio
    Draw, // empate
    Fold, // Retirarse poker
    AllIn // AllIn poker
}