using System.Text.Json;
using the_enigma_casino_server.Models.Database;
using the_enigma_casino_server.Games.Shared.Entities;
using the_enigma_casino_server.WS.Base;
using the_enigma_casino_server.WS.Interfaces;
using the_enigma_casino_server.WS.GameWS.Messages;
using the_enigma_casino_server.Games.Shared.Entities.Enum;
using System.Collections.Concurrent;

namespace the_enigma_casino_server.WS.GameWS;

public class GameMatchWS : BaseWebSocketHandler, IWebSocketMessageHandler
{
    public string Type => "gameMatch";

    public GameMatchWS(ConnectionManagerWS connectionManager, IServiceProvider serviceProvider)
        : base(connectionManager, serviceProvider)
    {
    }

    public async Task HandleAsync(string userId, JsonElement message)
    {
        if (!message.TryGetProperty("action", out var actionProp))
            return;

        string action = actionProp.GetString();

        await (action switch
        {
            GameMatchMessageTypes.StartMatch => HandleStartMatchAsync(userId, message),
            _ => Task.CompletedTask
        });
    }

    /// <summary>
    /// Lógica para iniciar una partida manualmente
    /// </summary>
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

    /// <summary>
    /// Inicia una partida asociada a una mesa
    /// </summary>
    public async Task StartMatchForTableAsync(int tableId)
    {
        Console.WriteLine($"🎯 [GameMatchWS] StartMatchForTableAsync llamado para la mesa {tableId}");

        IServiceScope scope;
        UnitOfWork unitOfWork = GetScopedService<UnitOfWork>(out scope);

        using (scope)
        {
            // 1. Obtener la mesa desde la base de datos
            GameTable table = await unitOfWork.GameTableRepository.GetByIdAsync(tableId);

            if (table == null)
            {
                Console.WriteLine($"❌ [GameMatchWS] start_match: mesa con ID {tableId} no encontrada.");
                return;
            }

            // 2. Cargar los jugadores desde la sesión activa en memoria
            if (_activeTables.TryGetValue(tableId, out var session))
            {
                table.Players = session.Table.Players;
            }

            if (table.Players.Count == 0)
            {
                Console.WriteLine($"❌ [GameMatchWS] start_match: la mesa {tableId} no tiene jugadores.");
                return;
            }

            // 3. Asegurarse de que cada jugador tiene su User completo (con NickName)
            foreach (var player in table.Players)
            {
                if (player.User == null)
                {
                    player.User = await unitOfWork.UserRepository.GetByIdAsync(player.UserId);
                }
            }

            // 4. Crear la partida
            GameMatch match = new GameMatch
            {
                GameTableId = tableId,
                GameTable = table,
                StartedAt = DateTime.UtcNow,
                MatchState = MatchState.InProgress,
                Players = table.Players
            };

            foreach (var player in match.Players)
            {
                player.GameMatch = match;
                player.GameMatchId = match.Id;
            }

            Console.WriteLine($"✅ [GameMatchWS] Partida iniciada en mesa {tableId} con {match.Players.Count} jugadores.");

            // 5. Obtener IDs y enviar mensaje con nicknames reales
            var userIds = table.Players.Select(p => p.UserId.ToString()).ToArray();

            await BroadcastToUsersAsync(userIds, new
            {
                type = GameMatchMessageTypes.MatchStarted,
                tableId = tableId,
                matchId = match.Id,
                players = table.Players.Select(p => p.User.NickName).ToArray(),
                startedAt = match.StartedAt
            });
        }
    }


    // Para acceder a las sesiones activas desde aquí
    private static readonly ConcurrentDictionary<int, ActiveGameSession> _activeTables = new();
}
