

namespace BlackJackGame.Ui;

public class UIConsole
{

    public UIConsole() { }

    public void ShowTitle()
    {
        Console.Clear();
        Console.WriteLine("\n╔══════════════════════════════════════════════════╗");
        Console.WriteLine("║\u001b[34m          🎲 ¡Bienvenido a BlackJack! 🎲          \u001b[0m║");
        Console.WriteLine("╚══════════════════════════════════════════════════╝\n");
        Console.WriteLine("                             _____");
        Console.WriteLine(" _____                _____ |6    |");
        Console.WriteLine("|2    | _____        |5    || o o | ");
        Console.WriteLine("|  o  ||3    | _____ | o o || o o | _____");
        Console.WriteLine("|     || o o ||4    ||  o  || o o ||7    |");
        Console.WriteLine("|  o  ||     || o o || o o ||____9|| o o | _____");
        Console.WriteLine("|____Z||  o  ||     ||____S|       |o o o||8    | _____");
        Console.WriteLine("       |____E|| o o |              | o o ||o o o||9    |");
        Console.WriteLine("              |____h|              |____L|| o o ||o o o|");
        Console.WriteLine("                                          |o o o||o o o|");
        Console.WriteLine("                                          |____8||o o o|");
        Console.WriteLine("                                                 |____6|\n");

        Thread.Sleep(800);
    }

    public void ShowBettingStartMessage()
    {
        Console.WriteLine("\n╔══════════════════════════════════════════════════╗");
        Console.Write("║");
        Console.ForegroundColor = ConsoleColor.Yellow;
        Console.Write("            💰 Iniciando Apuestas 💰              ");
        Console.ResetColor();
        Console.WriteLine("║");
        Console.WriteLine("╚══════════════════════════════════════════════════╝\n");
    }

    public void StartRound()
    {
        Console.WriteLine("\n╔══════════════════════════════════════════════════╗");
        Console.Write("║");
        Console.ForegroundColor = ConsoleColor.Cyan;
        Console.Write("            🃏 ¡Comienza la Ronda! 🃏            ");
        Console.ResetColor();
        Console.WriteLine("║");
        Console.WriteLine("╚══════════════════════════════════════════════════╝\n");
    }


    public void PlayersTurn()
    {
        Console.WriteLine("\n╔══════════════════════════════════════════════════╗");
        Console.Write("║");
        Console.ForegroundColor = ConsoleColor.Green;
        Console.Write("          🎯 Turno de los Jugadores 🎯            ");
        Console.ResetColor();
        Console.WriteLine("║");
        Console.WriteLine("╚══════════════════════════════════════════════════╝\n");
    }


    public void CroupierTurn()
    {
        Console.WriteLine("\n╔══════════════════════════════════════════════════╗");
        Console.Write("║");
        Console.ForegroundColor = ConsoleColor.Green;
        Console.Write("             🎲 Turno del Crupier 🎲               ");
        Console.ResetColor();
        Console.WriteLine("║");
        Console.WriteLine("╚══════════════════════════════════════════════════╝\n");
    }

    public void GameEvaluation()
    {
        Console.WriteLine("\n╔══════════════════════════════════════════════════╗");
        Console.Write("║");
        Console.ForegroundColor = ConsoleColor.Magenta;
        Console.Write("           🏆 Evaluación del Juego 🏆            ");
        Console.ResetColor();
        Console.WriteLine("║");
        Console.WriteLine("╚══════════════════════════════════════════════════╝\n");
    }

    public void EndOfTheGame()
    {
        Console.WriteLine("\n╔══════════════════════════════════════════════════╗");
        Console.Write("║");
        Console.ForegroundColor = ConsoleColor.Magenta;
        Console.Write("            🎉 ¡Fin de la partida! 🎉            ");
        Console.ResetColor();
        Console.WriteLine("║");
        Console.WriteLine("╚══════════════════════════════════════════════════╝\n");
    }
}
