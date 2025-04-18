using the_enigma_casino_server.Games.Shared.Entities;
using the_enigma_casino_server.Games.Shared.Enum;
using the_enigma_casino_server.WebSockets.Poker;
using the_enigma_casino_server.WebSockets.Poker.Interfaces;

namespace the_enigma_casino_server.Games.Poker;

public class PokerGameService
{
    public Match GameMatch => _gameMatch;
    public int CurrentTurnUserId => _currentTurnUserId;


    private readonly Match _gameMatch;
    private readonly IPokerNotifier _notifier;
    private Deck _deck;
    private readonly BlindManager _blindManager;
    private readonly PokerHandComparer _handComparer = new();
    private readonly Dictionary<int, int> _initialCoinsByUserId = new();
    private readonly List<Card> _communityCards = new();
    private readonly List<Pot> _pots = new();
    private readonly List<object> _lastShowdownSummary = new();
    private int _currentTurnUserId;
    private int _pot = 0;

    public PokerGameService(Match gameMatch, IPokerNotifier notifier)
    {
        _gameMatch = gameMatch;
        _notifier = notifier;
        _deck = new Deck(GameType.Poker);
        _deck.Shuffle();
        _blindManager = new BlindManager(gameMatch, this);
    }

    // FLUJO DE PARTIDA
    public void StartRound()
    {
        ResetDeck();
        ResetRoundState();
        DealInitialCards();
        AnnounceInitialHands();
        AssignFirstTurn();
    }

    public async Task AssignBlinds()
    {
        Console.WriteLine("\n--- Asigna ciegas a los jugadores activos ---\n");
        _blindManager.AssignBlinds();

        await _notifier.NotifyBlindsAsync(_gameMatch, this);
    }

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

    public void AdvanceTurn()
    {
        string phase = GetCurrentPhase();
        List<Player> players = _gameMatch.Players;
        int totalPlayers = players.Count;

        if (totalPlayers == 0) return;


        int currentIndex = players.FindIndex(p => p.UserId == _currentTurnUserId);
        if (currentIndex == -1)
        {
            Player? fallback = GetFirstToAct(phase);
            if (fallback != null)
            {
                _currentTurnUserId = fallback.UserId;
                return;
            }
            return;
        }

        for (int i = 1; i < totalPlayers; i++)
        {
            int nextIndex = (currentIndex + i) % totalPlayers;
            Player nextPlayer = players[nextIndex];

            if (nextPlayer.PlayerState != PlayerState.Playing || nextPlayer.User.Coins <= 0)
                continue;

            if (PokerActionTracker.HasPlayerActed(_gameMatch.GameTableId, nextPlayer.UserId, phase))
                continue;

            _currentTurnUserId = nextPlayer.UserId;
            Console.WriteLine($"➡️ Turno avanzado a {nextPlayer.User.NickName} (userId: {_currentTurnUserId})");
            return;
        }
    }

    public void StartTurn(Match match)
    {
        string phase = GetCurrentPhase();

        Player? firstToAct = GetFirstToAct(phase);

        if (firstToAct != null)
        {
            _currentTurnUserId = firstToAct.UserId;
            Console.WriteLine($"🎯 Primer jugador en actuar en fase '{phase}': {firstToAct.User.NickName} (userId: {_currentTurnUserId})");
        }
    }

    public void GeneratePots()
    {
        _pots.Clear();

        List<Player> playersWithBets = _gameMatch.Players
            .Where(p => p.TotalContribution > 0)
            .ToList();

        Console.WriteLine("\n♻️ Generando pots...");

        foreach (Player p in playersWithBets)
        {
            Console.WriteLine($"   - {p.User.NickName} contribuyó: {p.TotalContribution} fichas");
        }

        bool hasAllIn = _gameMatch.Players.Any(p =>
            (p.PlayerState == PlayerState.AllIn || p.PlayerState == PlayerState.Fold) &&
            p.TotalContribution > 0);

        if (!hasAllIn)
        {
            Pot mainPot = new Pot
            {
                Amount = playersWithBets.Sum(p => p.TotalContribution),
                EligiblePlayers = playersWithBets.ToList()
            };

            foreach (Player p in playersWithBets)
            {
                p.TotalContribution = 0;
            }

            _pots.Add(mainPot);
            Console.WriteLine($"💰 Pot único creado con {mainPot.Amount} fichas. Participantes: {string.Join(", ", mainPot.EligiblePlayers.Select(p => p.User.NickName))}");
            Console.WriteLine("✅ Solo se ha generado un Main Pot (todo normal)");
        }
        else
        {
            playersWithBets = playersWithBets.OrderBy(p => p.TotalContribution).ToList();

            while (playersWithBets.Any())
            {
                int minContribution = playersWithBets.First().TotalContribution;
                Pot pot = new Pot();

                Console.WriteLine($"\n➕ Nuevo pot con contribución mínima: {minContribution}");

                foreach (Player player in playersWithBets)
                {
                    int contribution = Math.Min(minContribution, player.TotalContribution);
                    pot.AddChips(contribution);
                    player.TotalContribution -= contribution;
                    pot.AddEligiblePlayer(player);

                    Console.WriteLine($"   ✅ {player.User.NickName} aporta {contribution} al pot (restante: {player.TotalContribution})");
                }

                Console.WriteLine($"💰 Pot creado con {pot.Amount} fichas. Participantes: {string.Join(", ", pot.EligiblePlayers.Select(p => p.User.NickName))}");

                _pots.Add(pot);

                playersWithBets = playersWithBets
                    .Where(p => p.TotalContribution > 0)
                    .OrderBy(p => p.TotalContribution)
                    .ToList();
            }

            Console.WriteLine($"⚠️ Se han generado {_pots.Count} pots. Verifica si hubo diferencias en las contribuciones y jugadores All-In.");
        }
    }

    public void Showdown()
    {
        ShowCommunityCards();  // Mostrar cartas comunitarias

        _lastShowdownSummary.Clear();

        List<Player> activePlayers = _gameMatch.Players
            .Where(p => p.PlayerState == PlayerState.Playing || p.PlayerState == PlayerState.AllIn)
            .ToList();

        Console.WriteLine($"Jugadores activos: {string.Join(", ", activePlayers.Select(p => p.User.NickName))}");

        if (!activePlayers.Any())
        {
            Console.WriteLine("No hay jugadores activos para el showdown.");
            return;
        }

        if (activePlayers.Count == 1)
        {
            Player winner = activePlayers.First();
            int amountWon = _pots.Sum(p => p.Amount);
            winner.Win(amountWon);

            PokerBetTracker.RegisterWinnings(_gameMatch.GameTableId, winner.UserId, amountWon);

            Console.WriteLine($"\n{winner.User.NickName} gana automáticamente el bote de {amountWon} fichas (único jugador activo).");

            _lastShowdownSummary.Add(new
            {
                userId = winner.UserId,
                nickname = winner.User.NickName,
                amount = amountWon,
                description = "Ganador automático (único jugador activo)",
                hand = winner.Hand.Cards.Select(c => new { suit = c.Suit.ToString(), rank = c.Rank.ToString(), value = c.Value }),
                potType = "Main Pot"
            });

            _pots.Clear();
            ResetCurrentBets();
            return;
        }

        List<EvaluatedHand> evaluatedHands = EvaluatePlayerHands(activePlayers);

        _lastShowdownSummary.AddRange(DistributePots(evaluatedHands));

        UpdatePlayerStates();

        _pots.Clear();
    }




    // UTILIDAD 
    public Player GetDealer() => _blindManager.Dealer;
    public Player GetSmallBlind() => _blindManager.SmallBlind;
    public Player GetBigBlind() => _blindManager.BigBlind;

    public List<Card> GetCommunityCards()
    {
        return _communityCards;
    }

    public List<object> GetShowdownSummary()
    {
        return _lastShowdownSummary;
    }

    public Player? GetFirstToAct(string phase)
    {
        List<Player> players = _gameMatch.Players;
        if (players.Count == 0) return null;

        int startingIndex = -1;

        if (phase == "preflop")
        {
            Player bigBlind = GetBigBlind();
            startingIndex = players.FindIndex(p => p.UserId == bigBlind.UserId);
        }
        else
        {
            Player dealer = GetDealer();
            startingIndex = players.FindIndex(p => p.UserId == dealer.UserId);
        }

        if (startingIndex == -1) return null;

        int totalPlayers = players.Count;
        for (int i = 1; i < totalPlayers; i++)
        {
            int index = (startingIndex + i) % totalPlayers;
            Player candidate = players[index];

            if (candidate.PlayerState == PlayerState.Playing && candidate.User.Coins > 0)
            {
                return candidate;
            }
        }

        return null;
    }

    public void HandlePokerBet(Player player, int amount)
    {
        if (amount == player.User.Coins)
            player.PlayerState = PlayerState.AllIn;

        Console.WriteLine($"[DEBUG] Apostando en mesa {player.GameTableId} - Jugador {player.UserId}");
        PokerBetTracker.RegisterBet(player.GameTableId, player.UserId, amount);

        player.PlaceBet(amount);
        player.TotalContribution += amount;
    }

    public string GetCurrentPhase()
    {
        return _communityCards.Count switch
        {
            0 => "preflop",
            3 => "flop",
            4 => "turn",
            5 => "river",
            _ => "unknown"
        };
    }

    public void AddToPot(int amount)
    {
        _pot += amount;
    }

    // PRIVADAS


    private void ResetCurrentPhaseBets()
    {
        foreach (var player in _gameMatch.Players)
        {
            player.CurrentBet = 0;
        }
    }

    private void ResetCurrentBets()
    {
        foreach (Player player in _gameMatch.Players)
        {
            player.CurrentBet = 0;
            player.TotalContribution = 0;
        }
    }

    private void ResetDeck()
    {
        _deck = new Deck(GameType.Poker);
        _deck.Shuffle();
        _communityCards.Clear();
    }

    private void ResetRoundState()
    {
        foreach (Player player in _gameMatch.Players)
        {
            if (player.User.Coins <= 0)
            {
                player.PlayerState = PlayerState.Waiting;
                Console.WriteLine($"{player.User.NickName} has no coins left and is now waiting.");
            }
            else
            {
                player.Hand = new Hand();
                player.TotalContribution = 0;
                player.CurrentBet = 0;
                player.PlayerState = PlayerState.Playing;
                _initialCoinsByUserId[player.UserId] = player.User.Coins;
            }
        }
    }

    private void DealInitialCards()
    {
        foreach (Player player in _gameMatch.Players.Where(p => p.PlayerState == PlayerState.Playing))
        {
            player.Hand.AddCard(_deck.Draw());
            player.Hand.AddCard(_deck.Draw());
        }
    }

    // BORRAR
    private void AnnounceInitialHands()
    {
        Console.WriteLine("\n--- Starting Poker Round ---\n");
        foreach (var player in _gameMatch.Players.Where(p => p.PlayerState == PlayerState.Playing))
        {
            string hand = string.Join(", ", player.Hand.Cards.Select(c => c.ToString()));
            Console.WriteLine($"{player.User.NickName}: {hand}");
        }
    }

    private void AssignFirstTurn()
    {
        Player? firstToAct = GetFirstToAct("preflop");
        if (firstToAct != null)
        {
            _currentTurnUserId = firstToAct.UserId;
            Console.WriteLine($"First turn assigned to {firstToAct.User.NickName} (userId: {_currentTurnUserId})");
        }
        else
        {
            Console.WriteLine("⚠️ No valid player found to assign the first turn.");
        }
    }

    // BORRAR
    private void ShowCommunityCards()
    {
        Console.WriteLine("\n--- Community Cards ---");
        foreach (var card in _communityCards)
        {
            Console.WriteLine(card);
        }
    }

    private List<EvaluatedHand> EvaluatePlayerHands(List<Player> activePlayers)
    {
        List<EvaluatedHand> evaluatedHands = new List<EvaluatedHand>();

        foreach (Player player in activePlayers)
        {
            List<Card> allCards = player.Hand.Cards.Concat(_communityCards).ToList();
            EvaluatedHand eval = PokerHandEvaluator.Evaluate(player, allCards);
            evaluatedHands.Add(eval);

            Console.WriteLine($"{player.User.NickName}: {string.Join(", ", player.Hand.Cards)} - Evaluación: {eval.Description}");
        }

        return evaluatedHands;
    }

    private List<object> DistributePots(List<EvaluatedHand> evaluatedHands)
    {
        Console.WriteLine("\n--- Distributing Pots ---");

        List<object> summary = new();

        for (int i = 0; i < _pots.Count; i++)
        {
            Pot pot = _pots[i];
            string label = i == 0 ? "Main Pot" : $"Side Pot {i}";
            string participantNicks = string.Join(", ", pot.EligiblePlayers.Select(p => p.User.NickName));

            Console.WriteLine($"\n🪙 {label}: {pot.Amount} fichas (Participantes: {participantNicks})");

            List<EvaluatedHand> eligibleHands = evaluatedHands
                .Where(eh => pot.EligiblePlayers.Contains(eh.Player))
                .ToList();

            EvaluatedHand bestHand = eligibleHands
                .OrderByDescending(e => e, _handComparer)
                .First();

            List<EvaluatedHand> winners = eligibleHands
                .Where(e => _handComparer.Compare(e, bestHand) == 0)
                .ToList();

            int rake = CalculateRake(pot.Amount);
            int distributableAmount = pot.Amount - rake;
            int winnings = distributableAmount / winners.Count;

            Console.WriteLine($"\n🏦 Rake aplicado: {rake} fichas de un total de {pot.Amount} fichas.");
            Console.WriteLine($"📊 Se reparten {distributableAmount} fichas entre {winners.Count} ganador(es).");
            Console.WriteLine($"💰 Cada uno recibe: {winnings} fichas");

            foreach (var winner in winners)
            {
                winner.Player.Win(winnings);
                PokerBetTracker.RegisterWinnings(_gameMatch.GameTableId, winner.Player.UserId, winnings);

                Console.WriteLine($"{winner.Player.User.NickName} gana {winnings} fichas del {label.ToLower()} con {winner.Description}");

                summary.Add(new
                {

                    userId = winner.Player.UserId,
                    nickname = winner.Player.User.NickName,
                    amount = winnings,
                    description = winner.Description,
                    hand = winner.Player.Hand.Cards.Select(c => new
                    {
                        suit = c.Suit.ToString(),
                        rank = c.Rank.ToString(),
                        value = c.Value
                    }),
                    potType = label
                });
            }
        }

        return summary;
    }


    private void UpdatePlayerStates()
    {
        foreach (Player player in _gameMatch.Players)
        {
            if (player.User.Coins <= 0)
            {
                player.PlayerState = PlayerState.Waiting;
                Console.WriteLine($"{player.User.NickName} se ha quedado sin fichas y pasa a modo espera.");
            }
        }
    }


    private int CalculateRake(int potAmount)
    {
        int rake = (int)Math.Floor(potAmount * 0.05);

        if (potAmount < 100) return Math.Min(rake, 2);   // máx 0.20 €
        if (potAmount < 300) return Math.Min(rake, 5);   // máx 0.50 €
        if (potAmount < 600) return Math.Min(rake, 10);  // máx 1.00 €
        return Math.Min(rake, 20);                       // máx 2.00 €
    }
}