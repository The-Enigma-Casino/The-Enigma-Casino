using the_enigma_casino_server.Games.Shared.Entities;
using the_enigma_casino_server.Games.Shared.Enum;
using the_enigma_casino_server.WebSockets.Poker;

namespace the_enigma_casino_server.Games.Poker;

public class PokerGame
{
    private readonly List<Player> _players;
    private Deck _deck;

    private int _dealerUserId;
    private readonly BlindManager _blindManager;
    private readonly PokerHandComparer _handComparer = new();
    private readonly List<Card> _communityCards = new();
    private readonly List<Pot> _pots = new();
    private readonly Dictionary<int, int> _initialCoinsByUserId = new();
    private readonly List<object> _lastShowdownSummary = new();
    public int CurrentTurnUserId { get; private set; }

    public PokerGame(List<Player> players, int dealerUserId)
    {
        _players = players;
        _dealerUserId = dealerUserId;
        _deck = new Deck(GameType.Poker);
        _deck.Shuffle();
        _blindManager = new BlindManager(_players, this, _dealerUserId);
    }

    public List<Card> GetCommunityCards() => _communityCards;
    public List<object> GetShowdownSummary() => _lastShowdownSummary;
    public Player GetDealer() => _blindManager.Dealer;
    public Player GetSmallBlind() => _blindManager.SmallBlind;
    public Player GetBigBlind() => _blindManager.BigBlind;

    public string GetCurrentPhase() => _communityCards.Count switch
    {
        0 => "preflop",
        3 => "flop",
        4 => "turn",
        5 => "river",
        _ => "unknown"
    };


    // Inicio de rondas y control de turnos
    public void StartRound()
    {
        ResetDeck();
        ResetRoundState();
        AssignBlindsInternally();
        DealInitialCards();
        AssignFirstTurn();
    }

    public void AssignBlindsInternally()
    {
        _blindManager.AssignBlinds();
    }

    private void DealInitialCards()
    {
        foreach (Player player in _players.Where(p => p.PlayerState == PlayerState.Playing))
        {
            player.Hand.AddCard(_deck.Draw());
            player.Hand.AddCard(_deck.Draw());
        }
    }

    private void ResetRoundState()
    {
        foreach (Player player in _players)
        {
            if (player.User.Coins <= 0)
            {
                player.PlayerState = PlayerState.Waiting;
                Console.WriteLine($"{player.User.NickName} no tiene fichas y pasa a modo espera.");
            }
            else
            {
                player.Hand = new Hand();
                player.CurrentBet = 0;
                player.PlayerState = PlayerState.Playing;
                _initialCoinsByUserId[player.UserId] = player.User.Coins;
            }
        }
    }
    private void ResetDeck()
    {
        _deck = new Deck(GameType.Poker);
        _deck.Shuffle();
        _communityCards.Clear();
    }

    private void AssignFirstTurn()
    {
        Player? firstToAct = GetFirstToAct("preflop");
        if (firstToAct != null)
        {
            CurrentTurnUserId = firstToAct.UserId;
            Console.WriteLine($"🎯 Primer turno asignado a {firstToAct.User.NickName}");
        }
        else
        {
            Console.WriteLine("⚠️ Ningún jugador válido para comenzar.");
        }
    }

    public void StartTurn(string phase)
    {
        Player? firstToAct = GetFirstToAct(phase);
        if (firstToAct != null)
        {
            CurrentTurnUserId = firstToAct.UserId;
            Console.WriteLine($"🎯 Primer turno de la fase '{phase}': {firstToAct.User.NickName}");
        }
    }


    public bool AdvanceTurn()
    {
        string phase = GetCurrentPhase();
        int currentIndex = _players.FindIndex(p => p.UserId == CurrentTurnUserId);

        if (currentIndex == -1)
        {
            Player? fallback = GetFirstToAct(phase);
            if (fallback != null)
            {
                CurrentTurnUserId = fallback.UserId;
                return true;
            }
            return false;
        }

        if (PokerHelper.OnlyOnePlayerLeft(_players))
        {
            Console.WriteLine("🏆 Solo queda un jugador. Ganador automático.");
            return false;
        }

        if (PokerHelper.AllPlayersAllInOrNoChips(_players))
        {
            Console.WriteLine("♠️ Todos están all-in o sin fichas. Se debe forzar showdown.");
            return false;
        }

        for (int i = 1; i < _players.Count; i++)
        {
            int nextIndex = (currentIndex + i) % _players.Count;
            Player nextPlayer = _players[nextIndex];

            if (nextPlayer.PlayerState != PlayerState.Playing || nextPlayer.User.Coins <= 0 || nextPlayer.HasAbandoned)
                continue;

            if (PokerActionTracker.HasPlayerActed(nextPlayer.GameTableId, nextPlayer.UserId, phase))
                continue;

            CurrentTurnUserId = nextPlayer.UserId;
            Console.WriteLine($"➡️ Turno avanzado a {nextPlayer.User.NickName}");
            return true;
        }

        Console.WriteLine("✅ Todos los jugadores activos han actuado. Debería avanzar fase.");
        return false;
    }


    public bool ShouldHandleImmediateWinner()
    {
        return PokerHelper.OnlyOnePlayerLeft(_players);
    }

    public bool ShouldHandleAllInShowdown()
    {
        return PokerHelper.AllPlayersAllInOrNoChips(_players);
    }


    public Player? GetFirstToAct(string phase)
    {
        if (!_players.Any()) return null;

        int startIndex = -1;

        if (phase == "preflop")
        {
            Player bigBlind = GetBigBlind();
            startIndex = _players.FindIndex(p => p.UserId == bigBlind.UserId);
        }
        else
        {
            Player dealer = GetDealer();
            startIndex = _players.FindIndex(p => p.UserId == dealer.UserId);
        }

        if (startIndex == -1) return null;

        for (int i = 1; i < _players.Count; i++)
        {
            int index = (startIndex + i) % _players.Count;
            Player candidate = _players[index];

            if (candidate.PlayerState == PlayerState.Playing && candidate.User.Coins > 0)
            {
                return candidate;
            }
        }

        return null;
    }


    // Gestión de apuestas

    public void HandlePokerBet(Player player, int amount)
    {
        if (amount == player.User.Coins)
            player.PlayerState = PlayerState.AllIn;

        Console.WriteLine($"[DEBUG] Apostando en mesa {player.GameTableId} - Jugador {player.UserId}");
        PokerBetTracker.RegisterBet(player.GameTableId, player.UserId, amount);

        player.PlaceBet(amount);
    }

    public void ResetCurrentPhaseBets()
    {
        foreach (Player player in _players)
        {
            player.CurrentBet = 0;
        }
    }

    public void ResetCurrentBets()
    {
        foreach (Player player in _players)
        {
            player.CurrentBet = 0;
            PokerBetTracker.ClearPlayer(player.GameTableId, player.UserId);
        }
    }


    // Avance de fases
    public void DealFlop()
    {
        _deck.BurnCard();
        _communityCards.AddRange(new[] { _deck.Draw(), _deck.Draw(), _deck.Draw() });

        ResetCurrentPhaseBets();

        Console.WriteLine("\n--- FLOP ---");
        PokerHelper.ShowCommunityCards(_communityCards);
    }

    public void DealTurn()
    {
        _deck.BurnCard();
        _communityCards.Add(_deck.Draw());

        ResetCurrentPhaseBets();

        Console.WriteLine("\n--- TURN ---");
        PokerHelper.ShowCommunityCards(_communityCards);
    }

    public void DealRiver()
    {
        _deck.BurnCard();
        _communityCards.Add(_deck.Draw());

        ResetCurrentPhaseBets();

        Console.WriteLine("\n--- RIVER  ---");
        PokerHelper.ShowCommunityCards(_communityCards);
    }


    // Showdown y reparto del bote

    public void GeneratePots()
    {
        _pots.Clear();

        List<Player> playersWithBets = _players
            .Where(p =>
                PokerBetTracker.GetTotalBet(p.GameTableId, p.UserId) > 0 &&
                p.PlayerState is PlayerState.Playing or PlayerState.AllIn or PlayerState.Fold or PlayerState.Left)
            .ToList();

        Console.WriteLine("\n♻️ Generando pots...");
        foreach (Player p in playersWithBets)
        {
            int contribution = PokerBetTracker.GetTotalBet(p.GameTableId, p.UserId);
            Console.WriteLine($"   - {p.User.NickName} contribuyó: {contribution} fichas");
        }

        List<Player> eligiblePlayers = playersWithBets
        .Where(p => p.PlayerState is PlayerState.Playing or PlayerState.AllIn)
        .ToList();

        if (eligiblePlayers.Count == 1)
        {
            int totalAmount = playersWithBets.Sum(p => PokerBetTracker.GetTotalBet(p.GameTableId, p.UserId));

            Pot soloPot = new Pot
            {
                Amount = totalAmount,
                EligiblePlayers = new List<Player> { eligiblePlayers[0] }
            };

            _pots.Add(soloPot);
            Console.WriteLine($"🏆 Solo queda un jugador ({eligiblePlayers[0].User.NickName}). Se le asignan directamente {totalAmount} fichas.");
            return;
        }

        bool needsSidePots = playersWithBets
            .Select(p => PokerBetTracker.GetTotalBet(p.GameTableId, p.UserId))
            .Distinct()
            .Count() > 1;

        if (!needsSidePots)
        {
            Pot mainPot = new Pot
            {
                Amount = playersWithBets.Sum(p => PokerBetTracker.GetTotalBet(p.GameTableId, p.UserId)),
                EligiblePlayers = eligiblePlayers
            };

            // Limpiar contribuciones
            _pots.Add(mainPot);
            Console.WriteLine("✅ Solo se ha generado un Main Pot.");
            return;
        }

        // Side pots
        playersWithBets = playersWithBets
            .OrderBy(p => PokerBetTracker.GetTotalBet(p.GameTableId, p.UserId))
            .ToList();

        while (playersWithBets.Any())
        {
            int minContribution = PokerBetTracker.GetTotalBet(playersWithBets.First().GameTableId, playersWithBets.First().UserId);
            Pot pot = new();

            foreach (Player player in playersWithBets)
            {
                int total = PokerBetTracker.GetTotalBet(player.GameTableId, player.UserId);
                int contribution = Math.Min(minContribution, total);

                pot.AddChips(contribution);
                PokerBetTracker.ReduceContribution(player.GameTableId, player.UserId, contribution);

                if (player.PlayerState is PlayerState.Playing or PlayerState.AllIn)
                    pot.AddEligiblePlayer(player);
            }

            _pots.Add(pot);

            playersWithBets = playersWithBets
                .Where(p => PokerBetTracker.GetTotalBet(p.GameTableId, p.UserId) > 0)
                .OrderBy(p => PokerBetTracker.GetTotalBet(p.GameTableId, p.UserId))
                .ToList();
        }

        Console.WriteLine($"⚠️ Se han generado {_pots.Count} pots debido a diferencias de apuestas.");
    }


    public List<object> DistributePots(List<EvaluatedHand> evaluatedHands)
    {
        List<object> summary = new();

        for (int i = 0; i < _pots.Count; i++)
        {
            Pot pot = _pots[i];
            string label = i == 0 ? "Main Pot" : $"Side Pot {i}";

            Console.WriteLine($"\n🪙 {label}: {pot.Amount} fichas");
            Console.WriteLine($"   Participantes: {string.Join(", ", pot.EligiblePlayers.Select(p => p.User.NickName))}");

            List<EvaluatedHand> eligibleHands = evaluatedHands
                .Where(e => pot.EligiblePlayers.Contains(e.Player))
                .ToList();

            if (!eligibleHands.Any())
            {
                Console.WriteLine($"❌ Nadie elegible para el {label}.");
                continue;
            }

            EvaluatedHand bestHand = eligibleHands
                .OrderByDescending(e => e, _handComparer)
                .First();

            List<EvaluatedHand> winners = eligibleHands
                .Where(e => _handComparer.Compare(e, bestHand) == 0)
                .ToList();

            int rake = CalculateRake(pot.Amount);
            int distributableAmount = pot.Amount - rake;
            int winnings = distributableAmount / winners.Count;

            Console.WriteLine($"🏦 Rake: {rake} | Reparto: {distributableAmount} → {winnings} por ganador");

            foreach (var winner in winners)
            {
                winner.Player.Win(winnings);
                PokerBetTracker.RegisterWinnings(winner.Player.GameTableId, winner.Player.UserId, winnings);

                summary.Add(new
                {
                    potType = label,
                    userId = winner.Player.UserId,
                    nickname = winner.Player.User.NickName,
                    amount = winnings,
                    description = winner.Description,
                    hand = winner.Player.Hand.Cards.Select(c => new
                    {
                        suit = c.Suit.ToString(),
                        rank = c.Rank.ToString(),
                        value = c.Value
                    })
                });

                Console.WriteLine($"✅ {winner.Player.User.NickName} gana {winnings} del {label} con: {winner.Description}");
            }
        }

        return summary;
    }

    public void Showdown()
    {
        _lastShowdownSummary.Clear();

        Console.WriteLine("[DEBUG] Estados de los jugadores al entrar a Showdown():");
        foreach (var p in _players)
        {
            Console.WriteLine($" - {p.User.NickName}: {p.PlayerState}");
        }

        List<Player> activePlayers = _players
        .Where(p =>
            (p.PlayerState == PlayerState.Playing || p.PlayerState == PlayerState.AllIn)
            && !p.HasAbandoned
        ).ToList();


        Console.WriteLine("[DEBUG] Jugadores activos detectados para el showdown:");
        foreach (var p in activePlayers)
        {
            Console.WriteLine($" - {p.User.NickName}");
        }

        if (!activePlayers.Any())
        {
            Console.WriteLine("No hay jugadores activos para el showdown.");
            return;
        }

        (int rake, int distributablePot) = CalculateRakeForShowdown();
        if (activePlayers.Count == 1)
        {
            Player winner = activePlayers.First();

            winner.Win(distributablePot);
            PokerBetTracker.RegisterWinnings(winner.GameTableId, winner.UserId, distributablePot);

            _lastShowdownSummary.Add(new
            {
                userId = winner.UserId,
                nickname = winner.User.NickName,
                amount = distributablePot,
                rake,
                description = "Ganador automático (único jugador activo)",
                hand = winner.Hand.Cards.Select(c => new
                {
                    suit = c.Suit.ToString(),
                    rank = c.Rank.ToString(),
                    value = c.Value
                }),
                potType = "Main Pot"
            });

            _pots.Clear();
            return;
        }

        List<EvaluatedHand> evaluatedHands = EvaluatePlayerHands(activePlayers);
        _lastShowdownSummary.AddRange(DistributePots(evaluatedHands));
        UpdatePlayerStates();
        _pots.Clear();
    }


    private List<EvaluatedHand> EvaluatePlayerHands(List<Player> activePlayers)
    {
        List<EvaluatedHand> result = new();

        foreach (Player player in activePlayers)
        {
            List<Card> allCards = player.Hand.Cards.Concat(_communityCards).ToList();
            EvaluatedHand evaluated = PokerHandEvaluator.Evaluate(player, allCards);
            result.Add(evaluated);
        }

        return result;
    }


    private int CalculateRake(int potAmount)
    {
        int rake = (int)Math.Floor(potAmount * 0.05);

        if (potAmount < 100) return Math.Min(rake, 2);
        if (potAmount < 300) return Math.Min(rake, 5);
        if (potAmount < 600) return Math.Min(rake, 10);
        return Math.Min(rake, 20);
    }

    private void UpdatePlayerStates()
    {
        foreach (var player in _players)
        {
            if (player.User.Coins <= 0)
            {
                player.PlayerState = PlayerState.Waiting;
                Console.WriteLine($"{player.User.NickName} se queda sin fichas y pasa a 'Waiting'.");
            }
        }
    }

    public int GetHighestCurrentBet()
    {
        return _players
            .Where(p => p.PlayerState is PlayerState.Playing or PlayerState.AllIn)
            .Max(p => p.CurrentBet);
    }

    public int GetCurrentBetForPlayer(int userId)
    {
        return _players.FirstOrDefault(p => p.UserId == userId)?.CurrentBet ?? 0;
    }

    public IEnumerable<(Player, int)> GetAllCurrentBets()
    {
        return _players.Select(p => (p, p.CurrentBet));
    }

    private bool WonByEarlyAbandonment()
    {
        string phase = GetCurrentPhase();

        bool noBets = _pots.Sum(p => p.Amount) <= 20;

        return _players.Count(p => p.PlayerState == PlayerState.Playing) == 1
               && (phase == "preflop" || phase == "flop")
               && noBets;
    }
    private (int rake, int distributable) CalculateRakeForShowdown()
    {
        int totalPot = _pots.Sum(p => p.Amount);

        if (WonByEarlyAbandonment())
        {
            Console.WriteLine($"[RAKE] No se aplica rake: abandono temprano. Pot: {totalPot}.");
            return (0, totalPot);
        }

        int rake = CalculateRake(totalPot);
        int net = totalPot - rake;

        Console.WriteLine($"[RAKE] Aplicando rake de {rake} fichas sobre pot de {totalPot}. Neto: {net}");
        return (rake, net);
    }


}