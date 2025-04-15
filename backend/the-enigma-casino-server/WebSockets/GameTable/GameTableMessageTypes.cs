namespace the_enigma_casino_server.WebSockets.GameTable;

public static class GameTableMessageTypes
{
    public const string JoinTable = "join_table";
    public const string LeaveTable = "leave_table";
    public const string TableUpdate = "table_update";
    public const string CountdownStarted = "countdown_started";
    public const string CountdownStopped = "countdown_stopped";
    public const string GameStart = "game_start";

}