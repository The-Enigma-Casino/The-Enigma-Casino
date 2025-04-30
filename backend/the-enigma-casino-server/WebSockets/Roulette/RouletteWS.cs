using System.Text.Json;
using the_enigma_casino_server.Games.Roulette;
using the_enigma_casino_server.Games.Roulette.Enums;
using the_enigma_casino_server.Games.Shared.Entities;
using the_enigma_casino_server.Games.Shared.Enum;
using the_enigma_casino_server.Infrastructure.Database;
using the_enigma_casino_server.Utilities;
using the_enigma_casino_server.WebSockets.Base;
using the_enigma_casino_server.WebSockets.GameMatch;
using the_enigma_casino_server.WebSockets.GameMatch.Store;
using the_enigma_casino_server.WebSockets.GameTable;
using the_enigma_casino_server.WebSockets.GameTable.Store;
using the_enigma_casino_server.WebSockets.Interfaces;

namespace the_enigma_casino_server.Websockets.Roulette;

public class RouletteWS : BaseWebSocketHandler, IWebSocketMessageHandler
{
    public string Type => "roulette";

    public RouletteWS(ConnectionManagerWS connectionManagerWS, IServiceProvider serviceProvider) : base(connectionManagerWS, serviceProvider) { }


    public async Task HandleAsync(string userId, JsonElement message)
    {
        if (message.TryGetProperty("action", out JsonElement actionProp))
        {
            string action = actionProp.GetString();
            await (action switch
            {
                RouletteMessageType.PlaceBet => HandlePlaceBetAsync(userId, message),
                RouletteMessageType.Spin => HandleSpinAsync(userId, message),
                RouletteMessageType.RequestGameState => HandleRequestGameStateAsync(userId, message),
                _ => Task.CompletedTask
            });

        }
    }

    public async Task StartRound(Match match)
    {
        if (match.MatchState != MatchState.InProgress)
        {
            Console.WriteLine($"⚠️ [StartRound] El Match no está InProgress ({match.MatchState}). Cancelando inicio de ronda.");
            return;
        }

        var rouletteGame = new RouletteGame();
        ActiveRouletteGameStore.Set(match.GameTableId, rouletteGame);
        Console.WriteLine($"[StartRound] Nueva partida de ruleta creada para mesa {match.GameTableId}.");

        rouletteGame.Reset();
        rouletteGame.ResumeBetting();

        await BroadcastBetsOpenedAsync(match.GameTableId);
        await BroadcastGameStateAsync(match.GameTableId);

        StartBettingPhase(match.GameTableId);

        Console.WriteLine($"[RouletteWS] Nueva ronda iniciada en mesa {match.GameTableId}.");
    }

    private void StartBettingPhase(int tableId)
    {

        Console.WriteLine($"[RouletteWS] Comienza fase de apuestas en mesa {tableId} (30s)");

        if (ActiveGameSessionStore.TryGet(tableId, out var session))
        {
            session.StartBettingTimer(30_000, async () =>
            {
                await OnBettingPhaseEnded(tableId);
            });
        }
    }


    private static readonly SemaphoreSlim _betLock = new(1, 1); // Bloqueo solo 1 pasa, por turnos
    private async Task HandlePlaceBetAsync(string userId, JsonElement message)
    {
        Console.WriteLine("🎯 Entrando en HandlePlaceBetAsync");

        if (!TryGetTableId(message, out int tableId)) return;
        if (!TryGetMatch(tableId, userId, out var match)) return;
        if (!TryGetPlayer(match, userId, out var player)) return;
        if (!TryGetRouletteGame(tableId, userId, out var rouletteGame)) return;

        try
        {
            await _betLock.WaitAsync();

            if (!rouletteGame.CanAcceptBets)
            {
                Console.WriteLine($"[❌ Apuesta fuera de tiempo] {player.User.NickName}");
                await SendErrorAsync(userId, "No se pueden hacer apuestas en este momento.");
                return;
            }

            if (player.PlayerState != PlayerState.Playing)
            {
                Console.WriteLine($"[❌ Apuesta denegada] {player.User.NickName} no está en estado 'Playing' (actual: {player.PlayerState})");
                await SendErrorAsync(userId, "Solo los jugadores activos pueden apostar.");
                return;
            }

            var bet = BuildRouletteBet(message);
            Console.WriteLine($"✅ {player.User.NickName} apuesta {bet.Amount} a {bet}");

            rouletteGame.RegisterBet(player, bet);

            UnitOfWork unitOfWork = GetScopedService<UnitOfWork>(out var scope);
            await unitOfWork.SaveAsync();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Error en apuesta: {ex.Message}");
            await SendErrorAsync(userId, ex.Message);
        }
        finally
        {
            _betLock.Release();
        }

        await BroadcastGameStateAsync(tableId);
    }


    private async Task OnBettingPhaseEnded(int tableId)
    {
        Console.WriteLine($"[RouletteWS] Fase de apuestas terminada en mesa {tableId}");

        if (!TryGetMatch(tableId, "SYSTEM", out var match))
        {
            Console.WriteLine($"[OnBettingPhaseEnded] No se encontró match para mesa {tableId}.");
            return;
        }

        if (!TryGetRouletteGame(tableId, "SYSTEM", out var rouletteGame))
        {
            Console.WriteLine($"[OnBettingPhaseEnded] No se encontró partida de ruleta activa para mesa {tableId}.");
            return;
        }

        rouletteGame.PauseBetting();
        await BroadcastBetsClosedAsync(tableId);

        bool anyBets = match.Players.Any(p => rouletteGame.HasPlayerBet(p.UserId));

        if (anyBets)
        {
            Console.WriteLine($"[RouletteWS] Jugadores apostaron en mesa {tableId}. Realizando spin...");
            await HandleSpinAsync("SYSTEM", BuildSpinMessage(tableId));
        }
        else
        {
            Console.WriteLine($"[RouletteWS] Sin apuestas en mesa {tableId}. Finalizando Match directamente...");

            using var finalizeScope = _serviceProvider.CreateScope();
            var gameMatchWS = finalizeScope.ServiceProvider.GetRequiredService<GameMatchWS>();
            await gameMatchWS.FinalizeAndEvaluateMatchAsync(tableId);

            if (ActiveGameSessionStore.TryGet(tableId, out var session))
            {

                session.CancelCountdown();
                session.CancelBettingTimer();
                session.CancelPostMatchTimer();

                var table = session.Table;
                var tableManager = finalizeScope.ServiceProvider.GetRequiredService<GameTableManager>();
                var unitOfWork = finalizeScope.ServiceProvider.GetRequiredService<UnitOfWork>();

                foreach (var player in table.Players.ToList())
                {
                    tableManager.RemovePlayerFromTable(table, player.UserId, out _);

                    var history = await unitOfWork.GameHistoryRepository.FindActiveSessionAsync(player.UserId, tableId);
                    if (history != null && history.LeftAt == null)
                    {
                        history.LeftAt = DateTime.Now;
                        unitOfWork.GameHistoryRepository.Update(history);
                    }
                }

                table.TableState = TableState.Waiting;
                unitOfWork.GameTableRepository.Update(table);
                await unitOfWork.SaveAsync();

                Console.WriteLine($"[RouletteWS] Todos los jugadores eliminados de la mesa {tableId} tras ronda sin apuestas.");
            }

            ActiveRouletteGameStore.Remove(tableId);
        }
    }


    private async Task CleanupTableAfterNoBetsAsync(int tableId, IServiceScope finalizeScope)
    {
        if (!ActiveGameSessionStore.TryGet(tableId, out var session))
            return;

        session.CancelCountdown();
        session.CancelBettingTimer();
        session.CancelPostMatchTimer();

        var table = session.Table;
        var tableManager = finalizeScope.ServiceProvider.GetRequiredService<GameTableManager>();
        var unitOfWork = finalizeScope.ServiceProvider.GetRequiredService<UnitOfWork>();

        foreach (var player in table.Players.ToList())
        {
            tableManager.RemovePlayerFromTable(table, player.UserId, out _);

            var history = await unitOfWork.GameHistoryRepository.FindActiveSessionAsync(player.UserId, tableId);
            if (history != null && history.LeftAt == null)
            {
                history.LeftAt = DateTime.Now;
                unitOfWork.GameHistoryRepository.Update(history);
            }
        }

        table.TableState = TableState.Waiting;
        unitOfWork.GameTableRepository.Update(table);
        await unitOfWork.SaveAsync();

        Console.WriteLine($"[RouletteWS] Todos los jugadores eliminados y mesa reseteada en mesa {tableId} tras ronda sin apuestas.");
    }


    public async Task HandleSpinAsync(string userId, JsonElement message, bool stopAfterSpin = false)
    {
        Console.WriteLine("Entrando en HandleSpinAsync");

        if (!TryGetTableId(message, out int tableId)) return;
        if (!TryGetMatch(tableId, userId, out var match)) return;
        if (!TryGetRouletteGame(tableId, userId, out var rouletteGame)) return;

        // Realiza el spin
        rouletteGame.SpinWheel();
        var result = rouletteGame.GetResult();
        Console.WriteLine($"Resultado: {result.Number} - {result.Color}");

        var activePlayers = match.Players.Where(p => p.PlayerState != PlayerState.Left).ToList();
        var allResults = rouletteGame.EvaluateAll(activePlayers);

        UnitOfWork unitOfWork = GetScopedService<UnitOfWork>(out IServiceScope scope);
        using (scope)
        {
            foreach (Player p in activePlayers)
            {
                unitOfWork.UserRepository.Update(p.User);
            }
            await unitOfWork.SaveAsync();
        }

        HandleInactivityTracking(tableId, match, rouletteGame);
        await SendSpinResultsAsync(tableId, allResults);
        await SendToAllPlayersAsync(tableId, new
        {
            type = Type,
            action = RouletteMessageType.RoulettePaused,
            tableId
        });

        using (var finalizeScope = _serviceProvider.CreateScope())
        {
            var gameMatchWS = finalizeScope.ServiceProvider.GetRequiredService<GameMatchWS>();
            await gameMatchWS.FinalizeMatchAsync(tableId);
        }

        StartPostMatchEvaluationTimer(tableId);
    }

    private void HandleInactivityTracking(int tableId, Match match, RouletteGame rouletteGame)
    {
        Console.WriteLine($"[RouletteWS] Evaluando inactividad para jugadores de mesa {tableId}...");

        using (var scope = _serviceProvider.CreateScope())
        {
            var inactivityTracker = scope.ServiceProvider.GetRequiredService<RouletteInactivityTracker>();

            int playersEvaluated = 0;

            foreach (Player player in match.Players)
            {
                bool playerBet = rouletteGame.HasPlayerBet(player.UserId);

                if (playerBet)
                {
                    inactivityTracker.ResetActivity(player);
                    Console.WriteLine($"[Inactividad] {player.User.NickName} apostó, actividad reseteada.");
                }
                else
                {
                    inactivityTracker.RegisterInactivity(player);
                    Console.WriteLine($"[Inactividad] {player.User.NickName} NO apostó, inactividad registrada.");
                }

                playersEvaluated++;
            }

            Console.WriteLine($"[RouletteWS] Inactividad evaluada para {playersEvaluated} jugadores en mesa {tableId}.");
        }
    }


    private RouletteBet BuildRouletteBet(JsonElement message)
    {
        var betType = Enum.Parse<RouletteBetType>(message.GetProperty("betType").GetString()!, ignoreCase: true);
        int amount = message.GetProperty("amount").GetInt32();

        var bet = new RouletteBet
        {
            BetType = betType,
            Amount = amount
        };

        if (message.TryGetProperty("number", out var numProp))
            bet.Number = numProp.GetInt32();

        if (message.TryGetProperty("color", out var colorProp))
            bet.Color = colorProp.GetString();

        if (message.TryGetProperty("evenOdd", out var evenOddProp))
            bet.EvenOdd = Enum.Parse<RouletteSimpleChoice>(evenOddProp.GetString()!, ignoreCase: true);

        if (message.TryGetProperty("dozen", out var dozenProp))
            bet.Dozen = dozenProp.GetInt32();

        if (message.TryGetProperty("column", out var columnProp))
            bet.Column = columnProp.GetInt32();

        if (message.TryGetProperty("highLow", out var highLowProp))
            bet.HighLow = Enum.Parse<RouletteSimpleChoice>(highLowProp.GetString()!, ignoreCase: true);

        return bet;
    }
    
    private async Task SendSpinResultsAsync(int tableId, Dictionary<int, List<RouletteSpinResult>> allResults)
    {
        if (!TryGetMatch(tableId, "SYSTEM", out var match))
        {
            Console.WriteLine($"[SendSpinResultsAsync] No se encontró match para la mesa {tableId}.");
            return;
        }

        if (!TryGetRouletteGame(tableId, "SYSTEM", out var rouletteGame))
        {
            Console.WriteLine($"[SendSpinResultsAsync] No se encontró partida activa de ruleta para la mesa {tableId}.");
            return;
        }

        foreach (Player player in match.Players.Where(p => p.PlayerState == PlayerState.Win || p.PlayerState == PlayerState.Lose))
        {
            var spinResults = allResults.GetValueOrDefault(player.UserId) ?? new List<RouletteSpinResult>();

            var payload = new
            {
                type = Type,
                action = RouletteMessageType.SpinResult,
                result = new
                {
                    number = rouletteGame.LastNumber,
                    color = rouletteGame.LastColor
                },
                results = spinResults.Select(r => new
                {
                    bet = r.Bet.ToString(),
                    isWinner = r.Won,
                    payout = r.Payout,
                    remainingCoins = r.RemainingCoins
                }).ToList()
            };

            await ((IWebSocketSender)this).SendToUserAsync(player.UserId.ToString(), payload);
        }
    }

    private void StartPostMatchEvaluationTimer(int tableId)
    {
        Console.WriteLine($"[RouletteWS] Programando cierre de Match en mesa {tableId} tras spin...");

        if (ActiveGameSessionStore.TryGet(tableId, out var session))
        {
            session.StartPostMatchTimer(15_000, async () =>
            {
                Console.WriteLine($"[RouletteWS] Finalizando Match para mesa {tableId} tras espera de resultados.");

                using var scope = _serviceProvider.CreateScope();
                var gameMatchWS = scope.ServiceProvider.GetRequiredService<GameMatchWS>();

                await gameMatchWS.EvaluatePostMatchAsync(tableId);
            });
        }
    }

    private async Task BroadcastGameStateAsync(int tableId)
    {
        if (!TryGetMatch(tableId, "SYSTEM", out var match)) return;
        if (!TryGetRouletteGame(tableId, "SYSTEM", out var rouletteGame)) return;

        var statePayload = new
        {
            type = Type,
            action = RouletteMessageType.GameState,
            tableId,
            canPlaceBets = rouletteGame.CanAcceptBets, 
            players = match.Players.Select(p => new
            {
                nickName = p.User.NickName,
                bets = rouletteGame.GetBetsForPlayer(p.UserId).Select(b => new
                {
                    bet = b.ToString(),
                    amount = b.Amount
                }).ToList()
            }),
        };

        foreach (Player player in match.Players.Where(p => p.PlayerState == PlayerState.Playing))
        {
            await ((IWebSocketSender)this).SendToUserAsync(player.UserId.ToString(), statePayload);
        }

    }


    private async Task HandleRequestGameStateAsync(string userId, JsonElement message)
    {
        if (!TryGetTableId(message, out int tableId)) return;
        if (!TryGetMatch(tableId, userId, out var match)) return;
        if (!TryGetRouletteGame(tableId, userId, out var rouletteGame)) return;

        var player = match.Players.FirstOrDefault(p => p.UserId.ToString() == userId);
        if (player == null) return;

        var statePayload = new
        {
            type = Type,
            action = RouletteMessageType.GameState,
            tableId,
            players = match.Players.Select(p => new
            {
                userId = p.UserId,
                nickname = p.User.NickName,
                remainingCoins = p.User.Coins,
                bets = rouletteGame.GetBetsForPlayer(p.UserId).Select(b => new
                {
                    bet = b.ToString(),
                    amount = b.Amount
                }).ToList()
            })
        };

        await ((IWebSocketSender)this).SendToUserAsync(userId, statePayload);
    }


    public Task ForceAdvanceTurnAsync(int tableId, int userId)
    {
        return Task.CompletedTask;
    }

    // Metodos TRY

    private bool TryGetTableId(JsonElement message, out int tableId)
    {
        tableId = 0;
        if (!message.TryGetProperty("tableId", out var tableIdProp) ||
            !int.TryParse(tableIdProp.GetString(), out tableId))
        {
            Console.WriteLine("TableId inválido.");
            return false;
        }
        return true;
    }

    private bool TryGetMatch(int tableId, string userId, out Match match)
    {
        if (!ActiveGameMatchStore.TryGet(tableId, out match))
        {
            Console.WriteLine($"No se encontró Match en la mesa {tableId}");
            _ = SendErrorAsync(userId, "No hay un match activo en esta mesa.");
            return false;
        }
        return true;
    }

    private bool TryGetPlayer(Match match, string userId, out Player player)
    {
        player = match.Players.FirstOrDefault(p => p.UserId.ToString() == userId);
        if (player == null)
        {
            Console.WriteLine($"Jugador {userId} no encontrado en Match.");
            _ = SendErrorAsync(userId, "Jugador no encontrado en la mesa.");
            return false;
        }
        return true;
    }

    private bool TryGetRouletteGame(int tableId, string userId, out RouletteGame rouletteGame)
    {
        if (!ActiveRouletteGameStore.TryGet(tableId, out rouletteGame))
        {
            Console.WriteLine($"No hay partida activa de ruleta en mesa {tableId}");
            _ = SendErrorAsync(userId, "No hay partida activa de ruleta en esta mesa.");
            return false;
        }
        return true;
    }

    public JsonElement BuildSpinMessage(int tableId)
    {
        var json = $"{{\"tableId\":\"{tableId}\"}}";
        return JsonDocument.Parse(json).RootElement;
    }

    private async Task BroadcastBetsClosedAsync(int tableId)
    {
        if (!TryGetMatch(tableId, "SYSTEM", out var match)) return;

        var payload = new
        {
            type = Type,
            action = RouletteMessageType.BetsClosed,
            tableId
        };

        foreach (Player player in match.Players.Where(p => p.PlayerState == PlayerState.Playing))
        {
            await ((IWebSocketSender)this).SendToUserAsync(player.UserId.ToString(), payload);
        }
    }

    private async Task BroadcastBetsOpenedAsync(int tableId)
    {
        if (!TryGetMatch(tableId, "SYSTEM", out var match)) return;

        var payload = new
        {
            type = Type,
            action = RouletteMessageType.BetsOpened,
            tableId,
            countdown = 30
        };

        foreach (Player player in match.Players.Where(p => p.PlayerState == PlayerState.Playing))
        {
            await ((IWebSocketSender)this).SendToUserAsync(player.UserId.ToString(), payload);
        }
    }

    public async Task SendToAllPlayersAsync(int tableId, object payload)
    {
        if (!TryGetMatch(tableId, "SYSTEM", out var match)) return;

        foreach (Player player in match.Players.Where(p => p.PlayerState == PlayerState.Playing))
        {
            await ((IWebSocketSender)this).SendToUserAsync(player.UserId.ToString(), payload);
        }
    }
}