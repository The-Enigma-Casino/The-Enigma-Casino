﻿using System.Text.Json;
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
using the_enigma_casino_server.WebSockets.Roulette;

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
                RouletteMessageType.WheelState => HandleRequestWheelStateAsync(userId, message),
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

        rouletteGame.Reset();
        rouletteGame.ResumeBetting();

        await BroadcastBetsOpenedAsync(match.GameTableId);
        await BroadcastGameStateAsync(match.GameTableId);

        StartBettingPhase(match.GameTableId);
    }

    private void StartBettingPhase(int tableId)
    {
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
        if (!TryGetTableId(message, out int tableId)) return;
        if (!TryGetMatch(tableId, userId, out var match)) return;
        if (!TryGetPlayer(match, userId, out var player)) return;
        if (!TryGetRouletteGame(tableId, userId, out var rouletteGame)) return;

        try
        {
            await _betLock.WaitAsync();

            if (!rouletteGame.CanAcceptBets)
            {
                await SendErrorAsync(userId, "No se pueden hacer apuestas en este momento.", Type);
                return;
            }

            if (player.PlayerState != PlayerState.Playing)
            {
                await SendErrorAsync(userId, "Solo los jugadores activos pueden apostar.", Type);
                return;
            }

            RouletteBet bet = BuildRouletteBet(message);

            if (bet.Amount > 0)
            {
                rouletteGame.RegisterBet(player, bet);
            }
            else
            {
                rouletteGame.RemoveOrReduceBet(player, bet);
            }


            UnitOfWork unitOfWork = GetScopedService<UnitOfWork>(out var scope);
            unitOfWork.UserRepository.Update(player.User);
            await unitOfWork.SaveAsync();
        }
        catch (Exception ex)
        {
            await SendErrorAsync(userId, ex.Message, Type);
        }
        finally
        {
            _betLock.Release();
        }

        await BroadcastGameStateAsync(tableId);
    }


    private async Task OnBettingPhaseEnded(int tableId)
    {
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
            await HandleSpinAsync("SYSTEM", BuildSpinMessage(tableId));
        }
        else
        {
            using var finalizeScope = _serviceProvider.CreateScope();
            var gameMatchWS = finalizeScope.ServiceProvider.GetRequiredService<GameMatchWS>();
            await gameMatchWS.FinalizeAndEvaluateMatchAsync(tableId);

            await CleanupTableAfterNoBetsAsync(tableId, finalizeScope);

            ActiveRouletteGameStore.Remove(tableId);
            RouletteRotationCache.Clear(tableId);
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
        var sender = finalizeScope.ServiceProvider.GetRequiredService<IWebSocketSender>();

        foreach (var player in table.Players.ToList())
        {
            tableManager.RemovePlayerFromTable(table, player.UserId, out _);

            await sender.SendToUserAsync(player.UserId.ToString(), new
            {
                type = Type,
                action = "round_cancelled",
                tableId,
                message = "La ronda fue cancelada porque ningún jugador apostó. Has sido removido de la mesa."
            });

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
    }



    public async Task HandleSpinAsync(string userId, JsonElement message, bool stopAfterSpin = false)
    {
        if (!TryGetTableId(message, out int tableId)) return;
        if (!TryGetMatch(tableId, userId, out var match)) return;
        if (!TryGetRouletteGame(tableId, userId, out var rouletteGame)) return;

        rouletteGame.SpinWheel();

        var result = rouletteGame.GetResult();
        var wheelRotation = rouletteGame.LastWheelRotation ?? 0;
        RouletteRotationCache.SaveRotation(tableId, wheelRotation);

        var ballRotation = rouletteGame.LastBallRotation ?? 0;


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
        await SendSpinResultsAsync(tableId, allResults, wheelRotation, ballRotation);
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
                }
                else
                {
                    inactivityTracker.RegisterInactivity(player);
                }

                playersEvaluated++;
            }
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
    
    private async Task SendSpinResultsAsync(int tableId, Dictionary<int, List<RouletteSpinResult>> allResults, double wheelRotation, double ballRotation)
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

        foreach (Player player in match.Players.Where(p => p.PlayerState != PlayerState.Left && p.PlayerState != PlayerState.Spectating))
        {
            List<RouletteSpinResult> spinResults = allResults.GetValueOrDefault(player.UserId) ?? new List<RouletteSpinResult>();

            int totalWon = spinResults.Where(r => r.Won).Sum(r => r.Payout);

            var payload = new
            {
                type = Type,
                action = RouletteMessageType.SpinResult,
                result = new
                {
                    number = rouletteGame.LastNumber,
                    color = rouletteGame.LastColor,
                    wheelRotation,
                    ballRotation
                },
                results = spinResults.Select(r => new
                {
                    bet = r.Bet.ToString(),
                    isWinner = r.Won,
                    payout = r.Payout,
                }).ToList(),
                totalWon
            };

            await ((IWebSocketSender)this).SendToUserAsync(player.UserId.ToString(), payload);
        }
    }

    private void StartPostMatchEvaluationTimer(int tableId)
    {
        if (ActiveGameSessionStore.TryGet(tableId, out var session))
        {
            session.StartPostMatchTimer(15_000, async () =>
            {
                if (!ActiveGameSessionStore.TryGet(tableId, out _))
                {
                    Console.WriteLine($"⛔ [PostMatchTimer] Mesa {tableId} ya no existe. Cancelando evaluación.");
                    return;
                }
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
            _ = SendErrorAsync(userId, "No hay un match activo en esta mesa.", Type);
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
            _ = SendErrorAsync(userId, "Jugador no encontrado en la mesa.", Type);
            return false;
        }
        return true;
    }

    private bool TryGetRouletteGame(int tableId, string userId, out RouletteGame rouletteGame)
    {
        if (!ActiveRouletteGameStore.TryGet(tableId, out rouletteGame))
        {
            Console.WriteLine($"No hay partida activa de ruleta en mesa {tableId}");
            _ = SendErrorAsync(userId, "No hay partida activa de ruleta en esta mesa.", Type);
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

    private async Task HandleRequestWheelStateAsync(string userId, JsonElement message)
    {
        if (!TryGetTableId(message, out int tableId)) return;
        if (!TryGetRouletteGame(tableId, userId, out var rouletteGame)) return;

        double rotation = RouletteRotationCache.GetRotation(tableId);

        await ((IWebSocketSender)this).SendToUserAsync(userId, new
        {
            type = Type,
            action = RouletteMessageType.WheelState,
            tableId,
            wheelRotation = rotation
        });
    }
    public async Task RestartRoundForSpectatorsAsync(int tableId)
    {
        if (!ActiveGameSessionStore.TryGet(tableId, out var session))
            return;

        var table = session.Table;

        bool allPlayersGone = table.Players.All(p =>
            p.PlayerState != PlayerState.Waiting &&
            p.PlayerState != PlayerState.Playing);

        var spectators = table.Players
            .Where(p => p.PlayerState == PlayerState.Spectating)
            .ToList();

        if (!allPlayersGone || spectators.Count == 0)
        {
            Console.WriteLine($"[RouletteWS] No se cumplen condiciones para reiniciar ronda por espectadores en mesa {tableId}.");
            return;
        }

        session.CancelPostMatchTimer();

        foreach (var s in spectators)
        {
            s.PlayerState = PlayerState.Waiting;
            s.HasAbandoned = false;
        }

        using var scope = _serviceProvider.CreateScope();
        var uow = scope.ServiceProvider.GetRequiredService<UnitOfWork>();
        uow.GameTableRepository.Update(table);
        await uow.SaveAsync();

        var matchWS = _serviceProvider.GetRequiredService<GameMatchWS>();
        await matchWS.StartMatchForTableAsync(tableId);
    }
}