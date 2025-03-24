using System.Collections.Concurrent;
using System.Text.Json;
using the_enigma_casino_server.Games.Shared.Entities;
using the_enigma_casino_server.Games.Shared.Entities.Enum;
using the_enigma_casino_server.Games.Shared.Services;
using the_enigma_casino_server.Models.Database;
using the_enigma_casino_server.Models.Database.Entities;
using the_enigma_casino_server.WS.Base;

namespace the_enigma_casino_server.WS.GameWS
{
    public class GameTableWS : BaseWebSocketHandler
    {
        // Diccionario que mantiene en memoria las mesas activas (con jugadores conectados)
        private readonly ConcurrentDictionary<int, ActiveGameSession> _activeTables = new();

        public GameTableWS(ConnectionManagerWS connectionManager, IServiceProvider serviceProvider)
            : base(connectionManager, serviceProvider)
        {
        }

        // Método para manejar los mensajes WebSocket
        public async Task HandleAsync(string userId, JsonElement message)
        {
            if (message.TryGetProperty("type", out JsonElement typeProp))
            {
                string type = typeProp.GetString();

                await (type switch
                {
                    "join_table" => HandleJoinTableAsync(userId, message),  
                    _ => Task.CompletedTask 
                });
            }
        }

        // Lógica que se ejecuta cuando un jugador quiere unirse a una mesa
        private async Task HandleJoinTableAsync(string userId, JsonElement message)
        {
            // Validar ID de la mesa
            if (!message.TryGetProperty("tableId", out JsonElement tableIdProp) ||
                !int.TryParse(tableIdProp.GetString(), out int tableId))
                return;

            // Validar ID del usuario
            if (!int.TryParse(userId, out int userIdInt))
                return;

            // Obtener repositorio de usuarios usando UnitOfWork y servicio scoped
            IServiceScope scope;
            UnitOfWork unitOfWork = GetScopedService<UnitOfWork>(out scope);
            using (scope)
            {
                User user = await unitOfWork.UserRepository.GetByIdAsync(userIdInt);
                if (user == null)
                {
                    Console.WriteLine($"[GameTableWS] Usuario con ID {userIdInt} no encontrado.");
                    return;
                }

                // Cargar o reutilizar la mesa en memoria
                ActiveGameSession session = await GetOrLoadTableAsync(tableId);
                if (session == null)
                {
                    Console.WriteLine($"[ERROR] No se pudo obtener sesión para mesa {tableId}");
                    return;
                }

                GameTable table = session.Table;

                // Bloqueo de concurrencia para evitar conflictos si varios se unen a la vez
                lock (table)
                {
                    if (table.TableState != TableState.Waiting)
                    {
                        Console.WriteLine($"[DEBUG] Mesa {table.Id} en estado {table.TableState}, se esperaba 'Waiting'.");
                        return;
                    }

                    if (table.Players.Any(p => p.UserId == user.Id))
                    {
                        Console.WriteLine($"[DEBUG] Usuario {user.Id} ya estaba en la mesa {table.Id}.");
                        return;
                    }

                    if (table.Players.Count >= table.MaxPlayer)
                    {
                        Console.WriteLine($"[DEBUG] Mesa {table.Id} está llena ({table.Players.Count}/{table.MaxPlayer}).");
                        return;
                    }

                    table.Players.Add(new Player(user));
                    Console.WriteLine($"[GameTableWS] {user.NickName} se unió a la mesa {table.Id}.");
                }

                // Enviar a todos los jugadores conectados la actualización de estado
                await BroadcastToUsersAsync(
                    session.GetConnectedUserIds(),
                    new
                    {
                        type = "table_update",
                        tableId = session.Table.Id,
                        players = session.GetPlayerNames(),
                        state = session.Table.TableState.ToString()
                    });

                // Si ya hay suficientes jugadores, iniciar la cuenta atrás
                if (table.Players.Count >= table.MinPlayer)
                {
                    session.StartOrRestartCountdown();
                }

                await BroadcastToUsersAsync(
                    session.GetConnectedUserIds(),
                    new
                    {
                        type = "countdown_started",
                        tableId = table.Id,
                        countdown = 30
                    });

            }
        }

        // Recupera la mesa desde memoria o desde base de datos
        private async Task<ActiveGameSession?> GetOrLoadTableAsync(int tableId)
        {
            if (_activeTables.TryGetValue(tableId, out ActiveGameSession existingSession))
                return existingSession;

            IServiceScope scope;
            GametableService gametableService = GetScopedService<GametableService>(out scope);
            using (scope)
            {
                GameTable? table = await gametableService.GetTableByIdAsync(tableId);
                if (table != null)
                {
                    // Creamos una nueva sesión con la mesa
                    ActiveGameSession newSession = new ActiveGameSession(
                        table,
                        OnStartMatchTimerFinished // Callback que implementaremos luego
                    );

                    _activeTables[tableId] = newSession;
                    return newSession;
                }

                return null;
            }
        }

        // Lógica cuando la cuenta atrás para iniciar la partida se ha completado
        private async void OnStartMatchTimerFinished(int tableId)
        {
            if (!_activeTables.TryGetValue(tableId, out ActiveGameSession session))
            {
                Console.WriteLine($"[GameTableWS] No se encontró la sesión activa para la mesa {tableId}.");
                return;
            }

            GameTable table = session.Table;

            lock (table)
            {
                if (table.TableState != TableState.Waiting)
                {
                    Console.WriteLine($"[GameTableWS] El estado de la mesa {tableId} ya no es 'Waiting'.");
                    return;
                }

                table.TableState = TableState.InProgress;
            }

            Console.WriteLine($"[GameTableWS] Iniciando partida en la mesa {tableId} automáticamente.");

            await BroadcastToUsersAsync(
                session.Table.Players.Select(p => p.UserId.ToString()),
                new
                {
                    type = "game_start",
                    tableId = session.Table.Id
                });
        }
    }
}
