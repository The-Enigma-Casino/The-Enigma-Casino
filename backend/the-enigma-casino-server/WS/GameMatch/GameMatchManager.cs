using the_enigma_casino_server.Games.Shared.Entities;
using the_enigma_casino_server.Games.Shared.Entities.Enum;
using the_enigma_casino_server.Models.Database;
using the_enigma_casino_server.WS.BlackJackWS;
using the_enigma_casino_server.WS.BlackJackWS.Store;
using the_enigma_casino_server.WS.GameTableWS.Store;
using the_enigma_casino_server.WS.GameWS.Services;

namespace the_enigma_casino_server.WS.GameMatch;

public class GameMatchManager
{
    private readonly UnitOfWork _unitOfWork;

    public GameMatchManager(UnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Match?> StartMatchAsync(Table table)
    {
        if (table.Players.Count < table.MinPlayer)
        {
            Console.WriteLine($"❌ [GameMatchManager] Jugadores insuficientes para iniciar la partida en mesa {table.Id}.");
            return null;
        }

        foreach (var player in table.Players)
        {
            if (player.User == null)
            {
                player.User = await _unitOfWork.UserRepository.GetByIdAsync(player.UserId);
            }
        }

        Match match = new Match
        {
            GameTableId = table.Id,
            GameTable = table,
            Players = table.Players,
            StartedAt = DateTime.UtcNow,
            MatchState = MatchState.InProgress
        };

        foreach (var player in match.Players)
        {
            player.ResetForNewRound();
            _unitOfWork.UserRepository.Update(player.User);
        }

        await _unitOfWork.SaveAsync();



        foreach (var player in match.Players)
        {
            player.GameMatch = match;
            player.GameMatchId = 0; // Si aún no guardamos en DB
        }

        return match;
    }

    public async Task<bool> EndMatchForPlayerAsync(Match match, int userId)
    {
        var player = match.Players.FirstOrDefault(p => p.UserId == userId);
        if (player == null) return false;

        bool matchPlayed = player.Hand?.Cards.Any() == true;
        await UpdateOrInsertHistoryAsync(player, match, playerLeftTable: true, matchPlayed);

        match.Players.Remove(player);
        BlackjackBetTracker.RemovePlayer(match.GameTableId, player.UserId);
        return true;
    }


    public async Task<bool> CancelMatchIfInsufficientPlayersAsync(Match match, GameTableManager tableManager)
    {
        if (match.Players.Count >= match.GameTable.MinPlayer)
            return false;

        bool gameStarted = match.Players.Any(p => p.Hand != null && p.Hand.Cards.Count > 0);

        if (!gameStarted)
        {
            Console.WriteLine("⛔ [GameMatchManager] Match cancelado antes de comenzar. Devolviendo fichas...");

            foreach (var player in match.Players.ToList())
            {
                player.User ??= await _unitOfWork.UserRepository.GetByIdAsync(player.UserId);

                await RefundBetIfNotPlayedAsync(player, match);

                tableManager.RemovePlayerFromTable(match.GameTable, player.UserId, out _);
            }


            match.GameTable.TableState = TableState.Waiting;

            if (ActiveGameSessionStore.TryGet(match.GameTableId, out var session))
                session.Table.TableState = TableState.Waiting;

            _unitOfWork.GameTableRepository.Update(match.GameTable);
            await _unitOfWork.SaveAsync();

            return true;
        }

        Console.WriteLine("🟡 [GameMatchManager] El match ya había empezado. No se cancela automáticamente.");
        return false;
    }



    public async Task EndMatchAsync(Match match)
    {
        match.EndedAt = DateTime.UtcNow;
        match.MatchState = MatchState.Finished;

        foreach (var player in match.Players)
        {
            if (player.PlayerState == PlayerState.Left)
            {
                Console.WriteLine($"ℹ️ [History] Jugador {player.UserId} ya procesado. Se omite.");
                continue;
            }

            await UpdateOrInsertHistoryAsync(player, match, playerLeftTable: false, matchPlayed: true);
        }

        Console.WriteLine($"🧹 Limpiando stores de la mesa {match.GameTableId}");
        ActiveGameMatchStore.Remove(match.GameTableId);
        ActiveBlackjackGameStore.Remove(match.GameTableId);

        Console.WriteLine($"🧼 ActiveGameMatchStore contiene: {ActiveGameMatchStore.GetAll().Count} items");
        Console.WriteLine($"🧼 ActiveBlackjackGameStore contiene: {ActiveBlackjackGameStore.GetAll().Count()} items");

        Console.WriteLine($"✅ [GameMatchManager] Match {match.GameTableId} finalizado y resultados guardados.");
    }

    private async Task UpdateOrInsertHistoryAsync(Player player, Match match, bool playerLeftTable, bool matchPlayed)
    {
        Console.WriteLine($"📘 [Historial] Procesando historial para jugador {player.UserId}");
        Console.WriteLine($"🔍 Estado: {player.PlayerState}, Apuesta actual: {player.CurrentBet}, Última apuesta: {player.LastBetAmount}");

        if (player.User == null)
        {
            Console.WriteLine($"ℹ️ [Historial] Cargando usuario {player.UserId} desde la base de datos...");
            player.User = await _unitOfWork.UserRepository.GetByIdAsync(player.UserId);
        }

        if (player.PlayerState == PlayerState.Left)
        {
            Console.WriteLine($"ℹ️ [Historial] Jugador {player.UserId} ya está marcado como 'Left'. Se omite.");
            return;
        }

        var history = await _unitOfWork.GameHistoryRepository.FindActiveSessionAsync(player.UserId, match.GameTableId);

        int matchCount = matchPlayed ? GetMatchCountForGameType(match.GameTable.GameType) : 0;
        int chips = matchPlayed ? GetChipResult(player) : 0;
        int totalBet = matchPlayed ? player.LastBetAmount : 0;

        bool hasBet = matchPlayed && player.LastBetAmount > 0;
        bool hasPlayed = matchPlayed && player.Hand != null && player.Hand.Cards.Count > 0;

        Console.WriteLine($"📊 Datos para historial: matchPlayed={matchPlayed}, hasBet={hasBet}, hasPlayed={hasPlayed}");
        Console.WriteLine($"🎯 matchCount={matchCount}, totalBet={totalBet}, chipResult={chips}");

        if (history == null)
        {
            if (!hasPlayed)
            {
                Console.WriteLine($"❌ [Historial] Jugador {player.UserId} no jugó ni apostó. No se guarda historial.");
                return;
            }

            Console.WriteLine($"🆕 [Historial] Creando nuevo historial para jugador {player.UserId}");

            history = new History
            {
                UserId = player.UserId,
                GameTableId = match.GameTableId,
                GameType = match.GameTable.GameType,
                JoinedAt = player.JoinedAt ?? DateTime.UtcNow,
                TotalMatchesPlayed = matchCount,
                TotalBetAmount = totalBet,
                ChipResult = chips,
                LeftAt = playerLeftTable ? DateTime.UtcNow : null
            };

            await _unitOfWork.GameHistoryRepository.InsertAsync(history);
            await _unitOfWork.SaveAsync();

            Console.WriteLine("✅ [Historial] Nuevo historial guardado correctamente.");
            return;
        }

        // 🛠 Ya existe historial → acumular datos si jugó
        if (matchPlayed && hasBet)
        {
            Console.WriteLine("🧮 [Historial] Acumulando datos en historial existente...");
            history.TotalMatchesPlayed += matchCount;
            history.TotalBetAmount += totalBet;
            history.ChipResult += chips;
        }

        // 🕒 Si se va de la mesa → cerrar historial
        if (playerLeftTable)
        {
            Console.WriteLine($"📦 [Historial] Marcando salida para jugador {player.UserId} → LeftAt: {DateTime.UtcNow}");
            history.LeftAt = DateTime.UtcNow;
            player.PlayerState = PlayerState.Left;
        }

        _unitOfWork.GameHistoryRepository.Update(history);
        await _unitOfWork.SaveAsync();

        Console.WriteLine("✅ [Historial] Historial actualizado correctamente.");
    }


    private static int GetMatchCountForGameType(GameType gameType)
    {
        return gameType switch
        {
            GameType.BlackJack => 1,
            GameType.Roulette => 1,
            GameType.Poker => 0,
            _ => 1
        };
    }


    private static int GetChipResult(Player player) =>
        player.PlayerState switch
        {
            PlayerState.Win => player.LastBetAmount * 2,
            PlayerState.Draw => player.LastBetAmount,
            _ => 0
        };


    public async Task RefundBetIfNotPlayedAsync(Player player, Match match)
    {
        bool gameStarted = match.Players.Any(p => p.Hand != null && p.Hand.Cards.Count > 0);

        if (!gameStarted && player.CurrentBet > 0)
        {
            Console.WriteLine($"💸 [Refund] Devolviendo {player.CurrentBet} monedas a {player.User.NickName} (no se jugó la ronda)");

            player.User.Coins += player.CurrentBet;
            player.CurrentBet = 0;

            _unitOfWork.UserRepository.Update(player.User);
            await _unitOfWork.SaveAsync();
        }
    }

    public async Task<bool> HandlePlayerExitAsync(Player player, Match match, int tableId, BlackjackWS blackjackWS)
    {
        Console.WriteLine("🚪 [HandlePlayerExitAsync] INICIANDO salida del jugador...");
        Console.WriteLine($"🔍 Jugador: {player.UserId}, Apuesta actual: {player.CurrentBet}, Estado: {player.PlayerState}");
        Console.WriteLine($"🃏 Tiene mano?: {(player.Hand != null ? "Sí" : "No")}, Nº cartas: {(player.Hand?.Cards.Count ?? 0)}");

        bool gameStarted = match.Players.Any(p => p.Hand != null && p.Hand.Cards.Count > 0);
        Console.WriteLine($"⏳ ¿Partida iniciada?: {gameStarted}");

        if (!gameStarted && player.CurrentBet > 0)
        {
            // ✅ Jugador se va antes de que empiece la ronda: se le devuelve la apuesta
            Console.WriteLine($"💸 [Antes de empezar] Jugador {player.UserId} se va → devolviendo {player.CurrentBet} monedas");

            int betAmount = player.CurrentBet;

            player.User.Coins += player.CurrentBet;
            player.CurrentBet = 0;

            Console.WriteLine($"💰 Nuevo saldo: {player.User.Coins} (se sumaron {betAmount})");
            Console.WriteLine("💾 Guardando cambios en UserRepository...");

            _unitOfWork.UserRepository.Update(player.User);
            await _unitOfWork.SaveAsync();

            Console.WriteLine("✅ Guardado completado");
        }
        else
        {
            // ✅ Jugador se va con la ronda ya empezada → derrota y se guarda historial
            if (player.PlayerState == PlayerState.Playing)
            {
                Console.WriteLine($"🏳️ [Después de empezar] Jugador {player.UserId} estaba jugando → se marca como DERROTA");
                player.PlayerState = PlayerState.Lose;
            }
            else
            {
                Console.WriteLine($"📌 Jugador no estaba en estado 'Playing' ({player.PlayerState}), no se marca derrota.");
            }

            Console.WriteLine("📝 Actualizando o insertando historial...");
            await UpdateOrInsertHistoryAsync(player, match, playerLeftTable: true, matchPlayed: true);
            Console.WriteLine("✅ Historial actualizado");
        }

        player.PlayerState = PlayerState.Left;
        Console.WriteLine($"🚶 Estado del jugador cambiado a: {player.PlayerState}");

        Console.WriteLine("🔄 Forzando avance de turno (por si era su turno actual)...");
        await blackjackWS.ForceAdvanceTurnAsync(tableId, player.UserId);
        Console.WriteLine("✅ Turno avanzado (si aplicaba)");

        Console.WriteLine("🧼 Eliminando jugador del Match...");
        bool removed = await EndMatchForPlayerAsync(match, player.UserId);

        if (!removed)
        {
            Console.WriteLine($"⚠️ [Error] No se pudo eliminar al jugador {player.UserId} del Match.");
            return false;
        }

        Console.WriteLine($"✅ [Finalizado] Jugador {player.UserId} ha salido correctamente de la partida (mesa {tableId})");
        return true;
    }



}