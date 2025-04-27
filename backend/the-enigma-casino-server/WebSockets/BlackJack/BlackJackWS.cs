using System.Text.Json;
using the_enigma_casino_server.Games.BlackJack;
using the_enigma_casino_server.Games.Shared.Entities;
using the_enigma_casino_server.Games.Shared.Enum;
using the_enigma_casino_server.Infrastructure.Database;
using the_enigma_casino_server.WebSockets.Base;
using the_enigma_casino_server.WebSockets.GameMatch;
using the_enigma_casino_server.WebSockets.GameMatch.Store;
using the_enigma_casino_server.WebSockets.GameTable;
using the_enigma_casino_server.WebSockets.GameTable.Store;
using the_enigma_casino_server.WebSockets.Interfaces;
using the_enigma_casino_server.WebSockets.Resolvers;

namespace the_enigma_casino_server.WebSockets.BlackJack;

public class BlackjackWS : BaseWebSocketHandler, IWebSocketMessageHandler, IGameTurnService
{
    public string Type => "blackjack";

    public BlackjackWS(ConnectionManagerWS connectionManager, IServiceProvider serviceProvider)
        : base(connectionManager, serviceProvider)
    {
    }

    public async Task HandleAsync(string userId, JsonElement message)
    {
        if (message.TryGetProperty("action", out JsonElement actionProp))
        {
            string action = actionProp.GetString()!;

            await (action switch
            {
                BlackjackMessageType.PlaceBet => HandlePlaceBetAsync(userId, message),
                BlackjackMessageType.DealInitialCards => HandleDealInitialCardsFromMessageAsync(message),
                BlackjackMessageType.PlayerHit => HandlePlayerHitAsync(userId, message),
                BlackjackMessageType.PlayerStand => HandlePlayerStandAsync(userId, message),
                BlackjackMessageType.DoubleDown => HandleDoubleDownAsync(userId, message),
                _ => Task.CompletedTask
            });
        }
    }

    public async Task StartRoundAsync(Match match)
    {
        Console.WriteLine($"🟢 [BlackjackWS] Iniciando nueva ronda de Blackjack para mesa {match.GameTableId}.");

        await HandleBetsOpenedAsync(match);
    }



    private async Task HandleDealInitialCardsFromMessageAsync(JsonElement message)
    {
        if (!message.TryGetProperty("tableId", out var tableIdProp) ||
            !int.TryParse(tableIdProp.GetString(), out int tableId))
        {
            Console.WriteLine($"❌ deal_initial_cards: tableId inválido.");
            return;
        }

        await HandleDealInitialCardsAsync(tableId);
    }


    private async Task HandlePlaceBetAsync(string userId, JsonElement message)
    {
        Console.WriteLine("✅ Entrando a HandlePlaceBetAsync");

        if (!TryGetTableId(message, out var tableId)) return;
        if (!TryGetMatch(tableId, userId, out var match)) return;

        if (!match.Players.Any(p => p.UserId == int.Parse(userId)))
        {
            Console.WriteLine($"❌ [WebSocket] Jugador {userId} no está en el Match actual. No puede apostar.");
            await SendErrorAsync(userId, "No puedes apostar hasta que comience la siguiente ronda.");
            return;
        }

        if (!TryGetPlayer(match, userId, out Player player)) return;

        if (player.CurrentBet > 0)
        {
            Console.WriteLine($"El jugador ya ha apostado. No se permite apostar varias veces.");
            await SendErrorAsync(userId, "Ya has apostado en esta ronda.");
            return;
        }

        if (player.PlayerState == PlayerState.Spectating)
        {
            Console.WriteLine($"❌ [BlackjackWS] Jugador {player.User.NickName} intentó apostar como espectador.");
            await SendErrorAsync(userId, "La ronda ya ha comenzado. Espera a la siguiente para poder jugar.");
            return;
        }

        int amount = message.GetProperty("amount").GetInt32();
        using var betScope = _serviceProvider.CreateScope();
        var betInfoProvider = betScope.ServiceProvider.GetRequiredService<GameBetInfoProviderResolver>().Resolve(match.GameTable.GameType);
        int minimumBet = betInfoProvider.GetMinimumRequiredCoins();

        Console.WriteLine($"🪙 [place_bet] Usuario {userId} intenta apostar {amount} monedas en la mesa {tableId}");

        if (amount > 5000 || amount < minimumBet)
        {
            Console.WriteLine($"❌ Apuesta inválida. Debe ser mayor o igual a {minimumBet} y menor o igual a 5000. 🪙");
            await SendErrorAsync(userId, $"La apuesta debe ser mayor o igual a {minimumBet} y menor o igual a 5000.");
            return;
        }


        try
        {
            player.PlaceBet(amount);
            var unitOfWork = GetScopedService<UnitOfWork>(out var scope);
            using (scope)
            {
                unitOfWork.UserRepository.Update(player.User);
                await unitOfWork.SaveAsync();
            }
            Console.WriteLine($"✅ {player.User.NickName} ha apostado {amount} monedas. Le quedan {player.User.Coins}.");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Error al apostar: {ex.Message}");
            await SendErrorAsync(userId, ex.Message);
            return;
        }

        var response = new
        {
            type = "bet_confirmed",
            userId = player.UserId,
            nickname = player.User.NickName,
            remainingCoins = player.User.Coins,
            bet = player.CurrentBet
        };

        await ((IWebSocketSender)this).SendToUserAsync(userId, response);
        BlackjackBetTracker.RegisterBet(tableId, player.UserId);

        var expectedPlayerIds = match.Players.Select(p => p.UserId).ToList();

        Console.WriteLine($"🎯 Jugadores esperados en match: {string.Join(", ", expectedPlayerIds)}");
        Console.WriteLine($"🎯 Jugadores que han apostado: {string.Join(", ", BlackjackBetTracker.GetAllForTable(tableId))}");
        Console.WriteLine($"🔍 Resultado HaveAllPlayersBet: {BlackjackBetTracker.HaveAllPlayersBet(tableId, expectedPlayerIds)}");

        if (BlackjackBetTracker.HaveAllPlayersBet(tableId, expectedPlayerIds))
        {
            BlackjackBetTracker.Clear(tableId);

            if (ActiveGameSessionStore.TryGet(tableId, out var session))
            {
                session.CancelBettingTimer();
            }

            Console.WriteLine($"♠️ Todos los jugadores han apostado en la mesa {tableId}. Iniciando reparto...");
            await HandleDealInitialCardsAsync(tableId);
        }

    }

    private async Task HandleBetsOpenedAsync(Match match)
    {
        var connectedUserIds = match.Players
            .Where(p => p.PlayerState == PlayerState.Playing || p.PlayerState == PlayerState.Blackjack)
            .Select(p => p.UserId.ToString())
            .ToList();

        await ((IWebSocketSender)this).BroadcastToUsersAsync(connectedUserIds, new
        {
            type = "blackjack",
            action = "bets_opened",
            tableId = match.GameTableId,
            bettingDuration = 30
        });

        Console.WriteLine($"🟢 [BlackjackWS] Fase de apuestas abierta para mesa {match.GameTableId}. Temporizador iniciado.");

        if (ActiveGameSessionStore.TryGet(match.GameTableId, out var session))
        {
            session.StartBettingTimer(30_000, async () =>
            {
                Console.WriteLine($"⏰ [BlackjackWS] Tiempo de apuestas agotado en mesa {match.GameTableId}. Evaluando estado...");
                await HandleNoBetsTimeoutAsync(match.GameTableId);
            });
        }
    }


    private async Task HandleNoBetsTimeoutAsync(int tableId)
    {
        if (!ActiveGameMatchStore.TryGet(tableId, out var match)) return;

        var expectedPlayerIds = match.Players
            .Where(p => p.PlayerState == PlayerState.Playing || p.PlayerState == PlayerState.Blackjack)
            .Select(p => p.UserId)
            .ToList();

        bool anyBets = expectedPlayerIds
            .Any(id => BlackjackBetTracker.GetAllForTable(tableId).Contains(id));

        if (anyBets)
        {
            Console.WriteLine($"✅ [BlackjackWS] Algún jugador apostó en la mesa {tableId}. No se cancela la partida.");
            return;
        }

        Console.WriteLine($"🧹 [BlackjackWS] Nadie apostó en la mesa {tableId}. Finalizando partida y limpiando mesa...");

        using var scope = _serviceProvider.CreateScope();
        var gameMatchWS = scope.ServiceProvider.GetRequiredService<GameMatchWS>();

        await gameMatchWS.FinalizeAndEvaluateMatchAsync(tableId);

        if (ActiveGameSessionStore.TryGet(tableId, out var session))
        {
            var table = session.Table;
            var tableManager = scope.ServiceProvider.GetRequiredService<GameTableManager>();

            foreach (var player in table.Players.ToList())
            {
                tableManager.RemovePlayerFromTable(table, player.UserId, out _);
            }

            table.TableState = TableState.Waiting;

            var uow = scope.ServiceProvider.GetRequiredService<UnitOfWork>();
            uow.GameTableRepository.Update(table);
            await uow.SaveAsync();
        }

        var connectedUserIds = match.Players
            .Where(p => p.PlayerState == PlayerState.Playing || p.PlayerState == PlayerState.Blackjack)
            .Select(p => p.UserId.ToString())
            .ToList();

        await ((IWebSocketSender)this).BroadcastToUsersAsync(connectedUserIds, new
        {
            type = "blackjack",
            action = "match_cancelled",
            reason = "Nadie apostó. La partida ha sido cancelada.",
            tableId
        });
    }


    public async Task CheckAutoStartAfterPlayerLeft(int tableId)
    {
        if (!ActiveGameMatchStore.TryGet(tableId, out Match match))
            return;

        var remainingPlayerIds = match.Players.Select(p => p.UserId).ToList();

        if (BlackjackBetTracker.HaveAllPlayersBet(tableId, remainingPlayerIds))
        {
            BlackjackBetTracker.Clear(tableId);
            Console.WriteLine($"♠️ Todos los jugadores han apostado (tras salida). Iniciando reparto...");
            await HandleDealInitialCardsAsync(tableId);
        }
    }


    public async Task HandleDealInitialCardsAsync(int tableId)
    {
        if (!TryGetMatch(tableId, "SYSTEM", out var match)) return;

        BlackjackGame blackjackGame = new BlackjackGame(match);
        blackjackGame.StartRound();

        // Asignar el turno inicial al primer jugador en estado Playing FIX
        var firstTurnPlayer = match.Players.FirstOrDefault(p => p.PlayerState == PlayerState.Playing);
        if (firstTurnPlayer != null)
        {
            blackjackGame.SetCurrentPlayer(firstTurnPlayer.UserId);
            Console.WriteLine($"🎯 Turno inicial asignado a {firstTurnPlayer.User.NickName} (UserId: {firstTurnPlayer.UserId})");
        }

        ActiveBlackjackGameStore.Set(tableId, blackjackGame);

        Console.WriteLine($"🔄 Repartiendo cartas iniciales para la mesa {tableId}...");

        foreach (Player player in match.Players)
        {
            Console.WriteLine($"👤 Jugador: {player.User.NickName} (ID: {player.UserId})");
            foreach (var card in player.Hand.Cards)
            {
                Console.WriteLine($"   🃏 {card.Rank} de {card.Suit} (valor: {card.Value})");
            }
            Console.WriteLine($"   ➕ Total: {player.Hand.GetTotal()}\n");
        }

        Console.WriteLine($"🧑‍⚖️ Crupier:");
        foreach (var card in match.GameTable.Croupier.Hand.Cards)
        {
            Console.WriteLine($"   🃏 {card.Rank} de {card.Suit} (valor: {card.Value})");
        }

        var visible = blackjackGame.GetCroupierVisibleCard();
        Console.WriteLine($"👁 Carta visible del crupier: {visible.Rank} de {visible.Suit} (valor: {visible.Value})");

        var response = new
        {
            type = Type,
            action = BlackjackMessageType.GameState,
            currentTurnUserId = blackjackGame.CurrentPlayerTurnId,
            players = match.Players.Select(p => new
            {
                userId = p.UserId,
                nickname = p.User.NickName,
                hand = p.Hand.Cards.Select(c => new
                {
                    rank = c.Rank.ToString(),
                    suit = c.Suit.ToString(),
                    value = c.Value
                }),
                total = p.Hand.GetTotal()
            }),
            croupier = new
            {
                visibleCard = new
                {
                    rank = visible.Rank.ToString(),
                    suit = visible.Suit.ToString(),
                    value = visible.Value
                }
            }
        };

        foreach (var p in match.Players)
        {
            await ((IWebSocketSender)this).SendToUserAsync(p.UserId.ToString(), response);
        }

        Console.WriteLine("✅ Estado inicial de la partida enviado a todos los jugadores.");
        Console.WriteLine(new string('-', 60));
    }


    private async Task HandlePlayerHitAsync(string userId, JsonElement message)
    {
        if (!TryGetTableId(message, out var tableId)) return;
        if (!TryGetMatch(tableId, userId, out var match)) return;
        if (!TryGetPlayer(match, userId, out Player player)) return;
        if (!TryGetBlackjackGame(tableId, userId, out BlackjackGame blackjackGame)) return;

        if (ActiveGameSessionStore.TryGet(tableId, out var session))
        {
            session.CancelTurnTimer();
        }

        if (!await IsPlayerTurnAsync(blackjackGame, player, userId)) return;

        blackjackGame.PlayerHit(player);
        var inactivityTracker = _serviceProvider.GetRequiredService<IGameInactivityTracker>();
        inactivityTracker.ResetActivity(player);

        Console.WriteLine($"🃏 {player.User.NickName} ha pedido carta. Nueva mano:");

        foreach (var card in player.Hand.Cards)
        {
            Console.WriteLine($"   🃏 {card.Rank} de {card.Suit} (valor: {card.Value})");
        }

        Console.WriteLine($"   ➕ Total: {player.Hand.GetTotal()}");

        if (player.PlayerState != PlayerState.Playing)
        {
            await AdvanceTurnAsync(blackjackGame, match, tableId);
        }


        await BroadcastGameStateAsync(match, blackjackGame);
    }

    private async Task HandlePlayerStandAsync(string userId, JsonElement message)
    {
        if (!TryGetTableId(message, out var tableId)) return;
        if (!TryGetMatch(tableId, userId, out var match)) return;
        if (!TryGetPlayer(match, userId, out Player player)) return;
        if (!TryGetBlackjackGame(tableId, userId, out BlackjackGame blackjackGame)) return;

        if (!await IsPlayerTurnAsync(blackjackGame, player, userId)) return;

        if (ActiveGameSessionStore.TryGet(tableId, out var session))
        {
            session.CancelTurnTimer();
        }

        player.Stand();
        var inactivityTracker = _serviceProvider.GetRequiredService<IGameInactivityTracker>();
        inactivityTracker.ResetActivity(player);

        Console.WriteLine($"🛑 {player.User.NickName} se planta.");

        await AdvanceTurnAsync(blackjackGame, match, tableId);
        await BroadcastGameStateAsync(match, blackjackGame);
    }

    private async Task HandleDoubleDownAsync(string userId, JsonElement message)
    {
        if (!TryGetTableId(message, out var tableId)) return;
        if (!TryGetMatch(tableId, userId, out var match)) return;
        if (!TryGetPlayer(match, userId, out Player player)) return;
        if (!TryGetBlackjackGame(tableId, userId, out BlackjackGame blackjackGame)) return;

        if (!await IsPlayerTurnAsync(blackjackGame, player, userId)) return;

        if (ActiveGameSessionStore.TryGet(tableId, out var session))
        {
            session.CancelTurnTimer();
        }

        blackjackGame.DoubleDown(player);
        var inactivityTracker = _serviceProvider.GetRequiredService<IGameInactivityTracker>();
        inactivityTracker.ResetActivity(player);

        var unitOfWork = GetScopedService<UnitOfWork>(out var scope);
        using (scope)
        {
            unitOfWork.UserRepository.Update(player.User);
            await unitOfWork.SaveAsync();
        }

        Console.WriteLine($"💰 {player.User.NickName} ha hecho Double Down y su apuesta es ahora de {player.CurrentBet}.");

        if (player.PlayerState != PlayerState.Playing)
        {
            await AdvanceTurnAsync(blackjackGame, match, tableId);
        }

        await BroadcastGameStateAsync(match, blackjackGame);
    }

    private async Task AdvanceTurnAsync(BlackjackGame blackjackGame, Match match, int tableId)
    {
        List<Player> players = match.Players
            .Where(p => p.PlayerState == PlayerState.Playing || p.PlayerState == PlayerState.Blackjack)
            .ToList();

        var currentIndex = players.FindIndex(p => p.UserId == blackjackGame.CurrentPlayerTurnId);

        Player nextPlayer = null;

        Console.WriteLine("⏭️ Evaluando próximo turno...");
        foreach (var p in players)
        {
            Console.WriteLine($" - {p.User.NickName} | Estado: {p.PlayerState}");
        }

        for (int i = 1; i <= players.Count; i++)
        {
            int nextIndex = (currentIndex + i) % players.Count;
            var candidate = players[nextIndex];
            if (candidate.PlayerState == PlayerState.Playing)
            {
                nextPlayer = candidate;
                break;
            }
        }

        if (nextPlayer != null)
        {
            blackjackGame.SetCurrentPlayer(nextPlayer.UserId);
            Console.WriteLine($"🔁 Turno cambiado → ahora juega {nextPlayer.User.NickName} (UserId: {nextPlayer.UserId})");
            if (ActiveGameSessionStore.TryGet(tableId, out var session))
            {
                session.StartTurnTimer(20_000, async () =>
                {
                    Console.WriteLine($"⏰ [BlackjackWS] Tiempo agotado para jugador {nextPlayer.UserId}, forzando Stand automático.");
                    await ForceStandAndAdvanceTurnAsync(nextPlayer.UserId, tableId);
                });
            }

            var connectedUserIds = match.Players
                .Where(p => p.PlayerState == PlayerState.Playing || p.PlayerState == PlayerState.Blackjack)
                .Select(p => p.UserId.ToString())
                .ToList();

            await ((IWebSocketSender)this).BroadcastToUsersAsync(connectedUserIds, new
            {
                type = "blackjack",
                action = "turn_started",
                tableId = tableId,
                currentTurnUserId = nextPlayer.UserId,
                turnDuration = 20
            });
        }
        else
        {
            Console.WriteLine("🧑‍⚖️ Todos los jugadores han terminado. Turno del crupier...");
            blackjackGame.CroupierTurn();

            Console.WriteLine("📊 Evaluando ronda solo para jugadores en match:");
            foreach (var p in match.Players)
            {
                Console.WriteLine($" - {p.User.NickName} | Estado: {p.PlayerState}");
            }

            // 🔥 Evaluación de ronda con resultados incluidos
            var results = blackjackGame.Evaluate();

            var unitOfWork = GetScopedService<UnitOfWork>(out var coinsScope);
            using (coinsScope)
            {
                foreach (var p in match.Players)
                {
                    unitOfWork.UserRepository.Update(p.User);
                }
                await unitOfWork.SaveAsync();
            }

            var matchManager = GetScopedService<GameMatchManager>(out var matchScope);
            using (matchScope)
            {
                foreach (var player in match.Players)
                {
                    var resolver = GetScopedService<GameBetInfoProviderResolver>(out var resolverScope);
                    using (resolverScope)
                    {
                        IGameBetInfoProvider provider = resolver.Resolve(match.GameTable.GameType);
                        bool matchPlayed = provider.HasPlayedThisMatch(player, match);
                        await matchManager.UpdateOrInsertHistoryAsync(player, match, playerLeftTable: false, matchPlayed);
                    }
                }
            }

            // 🟢 Enviar estado final de la partida
            await BroadcastGameStateAsync(match, blackjackGame);

            // 📨 Enviar mensaje round_result
            var roundResultPayload = new
            {
                type = "blackjack",
                action = "round_result",
                results = results,
                croupierTotal = match.GameTable.Croupier.Hand.GetTotal(),
                croupierHand = match.GameTable.Croupier.Hand.Cards.Select(c => new
                {
                    rank = c.Rank.ToString(),
                    suit = c.Suit.ToString(),
                    value = c.Value
                })
            };

            foreach (var p in match.Players)
            {
                await ((IWebSocketSender)this).SendToUserAsync(p.UserId.ToString(), roundResultPayload);
            }

            // ⏱️ Esperar 20 segundos antes de cerrar el match
            Console.WriteLine("⏱️ Iniciando temporizador de fin de ronda...");

            if (ActiveGameSessionStore.TryGet(tableId, out var session))
            {
                session.StartPostMatchTimer(20_000, async () =>
                {
                    var gameMatchWS = GetScopedService<GameMatchWS>(out var scope);
                    using (scope)
                    {
                        Console.WriteLine($"🧾 [GameMatchWS] EndMatchForAllPlayersAsync llamado para mesa {tableId} (desde temporizador)");
                        await gameMatchWS.FinalizeAndEvaluateMatchAsync(tableId);
                    }
                });
            }

            Console.WriteLine("✅ Ronda evaluada. Resultados enviados y partida finalizada.");
        }
    }


    private async Task BroadcastGameStateAsync(Match match, BlackjackGame blackjackGame)
    {
        bool isRoundFinished = match.Players.All(p => p.PlayerState != PlayerState.Playing);
        var visible = blackjackGame.GetCroupierVisibleCard();

        var croupierPayload = new
        {
            visibleCard = isRoundFinished ? null : new
            {
                rank = visible.Rank.ToString(),
                suit = visible.Suit.ToString(),
                value = visible.Value
            },
            fullHand = (object?)null,
            total = (int?)null
        };

        var response = new
        {
            type = "blackjack",
            action = BlackjackMessageType.GameState,
            currentTurnUserId = blackjackGame.CurrentPlayerTurnId,
            players = match.Players.Select(p => new
            {
                userId = p.UserId,
                nickname = p.User.NickName,
                hand = p.Hand.Cards.Select(c => new
                {
                    rank = c.Rank.ToString(),
                    suit = c.Suit.ToString(),
                    value = c.Value
                }),
                total = p.Hand.GetTotal(),
                state = p.PlayerState.ToString()
            }),
            croupier = croupierPayload
        };

        foreach (var p in match.Players)
        {
            await ((IWebSocketSender)this).SendToUserAsync(p.UserId.ToString(), response);
        }
    }

    private bool TryGetBlackjackGame(int tableId, string userId, out BlackjackGame blackjackGame)
    {
        if (!ActiveBlackjackGameStore.TryGet(tableId, out blackjackGame))
        {
            Console.WriteLine($"No hay BlackjackGame activo para mesa {tableId}");
            _ = SendErrorAsync(userId, "No hay partida activa de Blackjack en esta mesa.");
            return false;
        }
        return true;
    }

    private async Task<bool> IsPlayerTurnAsync(BlackjackGame game, Player player, string userId)
    {
        if (game.CurrentPlayerTurnId != player.UserId)
        {
            Console.WriteLine($"Acción no permitida: No es el turno de {player.User.NickName}");
            await SendErrorAsync(userId, "No es tu turno.");
            return false;
        }
        return true;
    }

    public async Task ForceAdvanceTurnAsync(int tableId, int userId)
    {
        if (!ActiveGameMatchStore.TryGet(tableId, out var match)) return;
        if (!ActiveBlackjackGameStore.TryGet(tableId, out BlackjackGame blackjackGame)) return;

        if (blackjackGame.CurrentPlayerTurnId != userId) return;

        Console.WriteLine($"🔄 [BlackjackWS] Forzando avance de turno tras la salida del jugador {userId}...");
        await AdvanceTurnAsync(blackjackGame, match, tableId);
        await BroadcastGameStateAsync(match, blackjackGame);
    }

    public async Task OnPlayerExitAsync(Player player, Match match)
    {
        int tableId = match.GameTableId;
        int userId = player.UserId;

        await ForceAdvanceTurnAsync(tableId, userId);
    }

    private async Task ForceStandAndAdvanceTurnAsync(int userId, int tableId)
    {
        if (!ActiveGameMatchStore.TryGet(tableId, out var match)) return;
        if (!TryGetPlayer(match, userId.ToString(), out Player player)) return;
        if (!ActiveBlackjackGameStore.TryGet(tableId, out BlackjackGame blackjackGame)) return;

        player.Stand();
        var inactivityTracker = _serviceProvider.GetRequiredService<IGameInactivityTracker>();
        inactivityTracker.RegisterInactivity(player);

        Console.WriteLine($"🛑 [BlackjackWS] Jugador {player.User.NickName} forzado a Stand por inactividad.");

        var connectedUserIds = match.Players
            .Where(p => p.PlayerState == PlayerState.Playing || p.PlayerState == PlayerState.Blackjack)
            .Select(p => p.UserId.ToString())
            .ToList();

        await ((IWebSocketSender)this).BroadcastToUsersAsync(connectedUserIds, new
        {
            type = "blackjack",
            action = "forced_stand",
            tableId = tableId,
            userId = player.UserId
        });

        await AdvanceTurnAsync(blackjackGame, match, tableId);
        await BroadcastGameStateAsync(match, blackjackGame);
    }
}
