using System.Text.Json;
using the_enigma_casino_server.Games.Shared.Entities;
using the_enigma_casino_server.Games.Shared.Entities.Enum;
using the_enigma_casino_server.Models.Database;
using the_enigma_casino_server.WS.Base;
using the_enigma_casino_server.WS.BlackJackWS;
using the_enigma_casino_server.WS.BlackJackWS.Store;
using the_enigma_casino_server.WS.GameTableWS.Store;
using the_enigma_casino_server.WS.GameWS.Services;
using the_enigma_casino_server.WS.Interfaces;
using the_enigma_casino_server.WS.Resolver;

namespace the_enigma_casino_server.WS.GameMatch;

public class GameMatchWS : BaseWebSocketHandler, IWebSocketMessageHandler
{
    public string Type => "gameMatch";

    private readonly BlackjackWS _blackjackWS;

    public GameMatchWS(ConnectionManagerWS connectionManager, IServiceProvider serviceProvider, BlackjackWS blackjackWS)
        : base(connectionManager, serviceProvider)
    {
        _blackjackWS = blackjackWS;
        connectionManager.OnUserDisconnected += HandleUserDisconnection;
    }


    private GameMatchManager CreateScopedManager(out IServiceScope scope)
    {
        scope = _serviceProvider.CreateScope();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<UnitOfWork>();
        return new GameMatchManager(unitOfWork);
    }


    public async Task HandleAsync(string userId, JsonElement message)
    {
        if (!message.TryGetProperty("action", out var actionProp))
            return;

        string action = actionProp.GetString();

        if (string.IsNullOrEmpty(action))
            return;

        switch (action)
        {
            case GameMatchMessageTypes.StartMatch:
                await HandleStartMatchAsync(userId, message);
                break;

            case GameMatchMessageTypes.LeaveMatch:
                await HandleLeaveMatchAsync(userId, message);
                break;
        }
    }

    private async Task HandleStartMatchAsync(string userId, JsonElement message)
    {
        if (!message.TryGetProperty("tableId", out var tableIdProp) ||
            !int.TryParse(tableIdProp.GetString(), out int tableId))
        {
            Console.WriteLine($"❌ start_match: tableId inválido.");
            return;
        }

        await StartMatchForTableAsync(tableId);
    }
    private async Task HandleLeaveMatchAsync(string userId, JsonElement message)
    {
        if (!int.TryParse(userId, out int userIdInt))
        {
            Console.WriteLine("❌ leave_match: userId inválido.");
            return;
        }

        if (!message.TryGetProperty("tableId", out var tableIdProp) ||
            !int.TryParse(tableIdProp.GetString(), out int tableId))
        {
            Console.WriteLine("❌ leave_match: tableId inválido.");
            return;
        }

        await EndMatchForPlayerAsync(tableId, userIdInt);
    }


    public async Task StartMatchForTableAsync(int tableId)
    {
        if (!ActiveGameSessionStore.TryGet(tableId, out var session))
        {
            Console.WriteLine($"❌ [GameMatchWS] No se encontró sesión activa para la mesa {tableId}");
            return;
        }

        Table table = session.Table;

        IServiceScope scope;
        UnitOfWork unitOfWork = GetScopedService<UnitOfWork>(out scope);
        using (scope)
        {
            GameMatchManager manager = new(unitOfWork);

            Match? match = await manager.StartMatchAsync(table);
            if (match == null)
                return;

            ActiveGameMatchStore.Set(table.Id, match);

            Console.WriteLine($"✅ [GameMatchWS] Partida iniciada en mesa {table.Id} con {match.Players.Count} jugadores.");

            var userIds = match.Players.Select(p => p.UserId.ToString()).ToArray();

            await BroadcastToUsersAsync(userIds, new
            {
                type = GameMatchMessageTypes.MatchStarted,
                tableId = table.Id,
                matchId = 0,
                players = table.Players.Select(p => p.User.NickName).ToArray(),
                startedAt = match.StartedAt
            });
        }
    }



    private async Task EndMatchForPlayerAsync(int tableId, int userId)
    {
        if (!ActiveGameMatchStore.TryGet(tableId, out var match))
        {
            Console.WriteLine($"❌ [GameMatchWS] No hay partida activa en la mesa {tableId}");
            return;
        }

        using var scope = _serviceProvider.CreateScope();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<UnitOfWork>();
        var manager = new GameMatchManager(unitOfWork);
        var tableManager = scope.ServiceProvider.GetRequiredService<GameTableManager>();

        // 🧠 Buscar al jugador antes de quitarlo
        var player = match.Players.FirstOrDefault(p => p.UserId == userId);
        if (player == null)
        {
            Console.WriteLine($"⚠️ [GameMatchWS] Jugador {userId} no encontrado en partida.");
            return;
        }

        // 🏳️ Si abandona con estado "Playing", se considera derrota
        if (player.PlayerState == PlayerState.Playing)
        {
            player.PlayerState = PlayerState.Lose;
            Console.WriteLine($"🏳️ [GameMatchWS] Jugador {userId} abandonó la partida → DERROTA");
        }

        await _blackjackWS.ForceAdvanceTurnAsync(tableId, userId);

        bool removed = await manager.EndMatchForPlayerAsync(match, userId);
        if (!removed)
        {
            Console.WriteLine($"⚠️ [GameMatchWS] No se pudo eliminar al jugador {userId} de la partida.");
            return;
        }

        Console.WriteLine($"👤 [GameMatchWS] Jugador {userId} ha terminado su partida en mesa {tableId}");

        // 🧠 Re-evaluar si los jugadores restantes ya han apostado
        if (match.GameTable.GameType == GameType.BlackJack)
        {
            var expectedPlayerIds = match.Players.Select(p => p.UserId).ToList();
            Console.WriteLine($"🧪 Re-evaluando apuestas tras la salida de {userId}");
            Console.WriteLine($"🎯 Nuevos jugadores esperados: {string.Join(", ", expectedPlayerIds)}");
            Console.WriteLine($"🎯 Jugadores que han apostado: {string.Join(", ", BlackjackBetTracker.GetAllForTable(tableId))}");

            if (BlackjackBetTracker.HaveAllPlayersBet(tableId, expectedPlayerIds))
            {
                BlackjackBetTracker.Clear(tableId);
                Console.WriteLine($"♠️ Todos los jugadores restantes han apostado en la mesa {tableId}. Iniciando reparto...");
                await _blackjackWS.HandleDealInitialCardsAsync(tableId);
            }
        }

        await SendToUserAsync(userId.ToString(), new
        {
            type = GameMatchMessageTypes.MatchEnded,
            tableId,
            endedAt = DateTime.UtcNow
        });

        var otherUserIds = match.Players.Select(p => p.UserId.ToString()).ToArray();
        await BroadcastToUsersAsync(otherUserIds, new
        {
            type = GameMatchMessageTypes.PlayerLeftMatch,
            tableId,
            userId,
        });

        bool cancelled = await manager.CancelMatchIfInsufficientPlayersAsync(match, tableManager);

        if (cancelled)
        {
            ActiveGameMatchStore.Remove(tableId);

            await BroadcastToUsersAsync(otherUserIds, new
            {
                type = GameMatchMessageTypes.MatchCancelled,
                tableId,
                reason = "not_enough_players"
            });

            Console.WriteLine($"🧹 [GameMatchWS] Match eliminado por jugadores insuficientes en mesa {tableId}");
        }
    }


    public async Task EndMatchForAllPlayersAsync(int tableId)
    {
        if (!ActiveGameMatchStore.TryGet(tableId, out var match))
        {
            Console.WriteLine($"❌ [GameMatchWS] No hay partida activa en la mesa {tableId}");
            return;
        }

        using var scope = _serviceProvider.CreateScope();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<UnitOfWork>();
        var manager = new GameMatchManager(unitOfWork);

        await manager.EndMatchAsync(match);
        ActiveGameMatchStore.Remove(tableId);

        Console.WriteLine($"🧾 [GameMatchWS] Match finalizado y guardado en la mesa {tableId}");

        var userIds = match.GameTable.Players.Select(p => p.UserId.ToString()).ToList();

        await BroadcastToUsersAsync(userIds, new
        {
            type = GameMatchMessageTypes.MatchEnded,
            tableId,
            endedAt = DateTime.UtcNow
        });

        if (ActiveGameSessionStore.TryGet(tableId, out var session))
        {
            Table table = session.Table;

            if (table.Players.Count >= table.MinPlayer)
            {
                Console.WriteLine($"🕹 [GameMatchWS] Hay suficientes jugadores, iniciando nueva partida en mesa {table.Id}");
                await StartMatchForTableAsync(table.Id);
            }
            else
            {
                if (table.GameType == GameType.Poker && table.Players.Count < table.MinPlayer)
                {
                    Console.WriteLine($"🚫 [GameMatchWS] Jugadores insuficientes para Poker. Expulsando a todos de la mesa {table.Id}.");

                    foreach (var player in table.Players.ToList())
                    {
                        await EndMatchForPlayerAsync(table.Id, player.UserId);
                    }
                }
                else
                {
                    Console.WriteLine($"🕹 [GameMatchWS] No se inicia nueva partida, pero el juego permite continuar con {table.Players.Count} jugador(es).");
                }
            }
        }
    }


    private async void HandleUserDisconnection(string userId)
    {
        if (!int.TryParse(userId, out int userIdInt))
            return;

        foreach (var (tableId, match) in ActiveGameMatchStore.GetAll())
        {
            if (match.Players.Any(p => p.UserId == userIdInt))
            {
                await EndMatchForPlayerAsync(tableId, userIdInt);
                break;
            }
        }
    }
}