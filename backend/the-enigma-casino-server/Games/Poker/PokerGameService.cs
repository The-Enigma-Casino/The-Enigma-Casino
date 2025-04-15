using the_enigma_casino_server.Games.Shared.Entities;
using the_enigma_casino_server.Games.Shared.Enum;
using the_enigma_casino_server.WebSockets.Poker;

namespace the_enigma_casino_server.Games.Poker;

public class PokerGameService
{
    private Match _gameMatch;
    private Deck _deck;
    private List<Card> _communityCards = new();
    private int _pot = 0;
    private BlindManager _blindManager;
    private List<Pot> _pots = new();
    private const int SmallBlindAmount = 10;
    private const int BigBlindAmount = 20;
    private readonly PokerHandComparer _handComparer = new();
    private readonly Dictionary<int, int> _initialCoinsByUserId = new();

    private int _currentTurnUserId;
    public int CurrentTurnUserId => _currentTurnUserId;
    private List<object> _lastShowdownSummary = new();
    public Match GameMatch => _gameMatch;


    public PokerGameService(Match gameMatch)
    {
        _gameMatch = gameMatch;
        _deck = new Deck(GameType.Poker);
        _deck.Shuffle();
        _blindManager = new BlindManager(gameMatch, this);
    }

    public void AddToPot(int amount)
    {
        _pot += amount;
    }

    // Reparte 2 cartas por jugador activo
    public void StartRound()
    {
        _deck = new Deck(GameType.Poker);
        _deck.Shuffle(); //Baraja

        _communityCards.Clear(); //Cartas comunitarias de todos los jugadores


        foreach (Player player in _gameMatch.Players)
        {
            if (player.User.Coins <= 0)
            {
                player.PlayerState = PlayerState.Waiting;
                Console.WriteLine($"{player.User.NickName} se queda sin fichas y pasa a modo espera.");
            }
            else
            {
                player.Hand = new Hand();
                player.TotalContribution = 0; // Total apostado en la ronda (para pots)
                player.CurrentBet = 0;
                player.PlayerState = PlayerState.Playing;
                _initialCoinsByUserId[player.UserId] = player.User.Coins;
            }

        }

        foreach (Player player in _gameMatch.Players.Where(p => p.PlayerState == PlayerState.Playing))
        {
            player.Hand.AddCard(_deck.Draw());
            player.Hand.AddCard(_deck.Draw());
        }

        Console.WriteLine("\n--- Iniciando ronda de Poker ---\n");
        foreach (var player in _gameMatch.Players.Where(p => p.PlayerState == PlayerState.Playing))
        {
            var hand = string.Join(", ", player.Hand.Cards.Select(c => c.ToString()));
            Console.WriteLine($"{player.User.NickName}: {hand}");
        }

        var activePlayers = _gameMatch.Players
            .Where(p => p.PlayerState == PlayerState.Playing && p.User.Coins > 0)
            .ToList();

        int bigBlindIndex = _gameMatch.Players.FindIndex(p => p.UserId == GetBigBlind().UserId);

        for (int i = 1; i <= _gameMatch.Players.Count; i++)
        {
            int nextIndex = (bigBlindIndex + i) % _gameMatch.Players.Count;
            var nextPlayer = _gameMatch.Players[nextIndex];

            if (nextPlayer.PlayerState == PlayerState.Playing && nextPlayer.User.Coins > 0)
            {
                _currentTurnUserId = nextPlayer.UserId;
                Console.WriteLine($"🟢 Primer turno asignado a {nextPlayer.User.NickName} (userId: {_currentTurnUserId})");
                break;
            }
        }

    }

    public void Showdown()
    {
        Console.WriteLine("\n--- Showdown ---");
        Console.WriteLine("Cartas comunitarias:");
        foreach (var card in _communityCards)
        {
            Console.WriteLine(card);
        }

        _lastShowdownSummary.Clear();

        var activePlayers = _gameMatch.Players
            .Where(p => p.PlayerState == PlayerState.Playing || p.PlayerState == PlayerState.AllIn)
            .ToList();

        Console.WriteLine($"\n[DEBUG] Iniciando Showdown() con {_pots.Count} pot(s)");
        Console.WriteLine($"Jugadores activos: {string.Join(", ", activePlayers.Select(p => p.User.NickName))}");

        if (!activePlayers.Any())
        {
            Console.WriteLine("No hay jugadores activos para el showdown.");
            return;
        }

        if (activePlayers.Count == 1)
        {
            var winner = activePlayers.First();
            int amountWon = _pots.Sum(p => p.Amount);
            winner.Win(amountWon);

            Console.WriteLine($"\n{winner.User.NickName} gana automáticamente el bote de {amountWon} fichas (único jugador activo).");

            _lastShowdownSummary.Add(new
            {
                userId = winner.UserId,
                nickname = winner.User.NickName,
                amount = amountWon,
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

        // Evaluar manos de los jugadores activos
        Console.WriteLine("\nCartas de los jugadores:");
        var evaluatedHands = new List<EvaluatedHand>();

        foreach (var player in activePlayers)
        {
            var allCards = player.Hand.Cards.Concat(_communityCards).ToList();
            Console.WriteLine($"\n {player.User.NickName}: {string.Join(", ", player.Hand.Cards)}");

            var eval = PokerHandEvaluator.Evaluate(player, allCards);
            evaluatedHands.Add(eval);

            Console.WriteLine($"Evaluación: {eval.Description}");
        }

        Console.WriteLine("\n Repartiendo los botes:");

        for (int i = 0; i < _pots.Count; i++)
        {
            var pot = _pots[i];
            string label = _pots.Count == 1 ? "Main Pot" : i == 0 ? "Main Pot" : $"Side Pot {i}";
            var participantNicks = string.Join(", ", pot.EligiblePlayers.Select(p => p.User.NickName));
            string explanation = label.StartsWith("Side Pot")
                ? $" (sólo {participantNicks} apuesta más que los demás)"
                : $" (Participan: {participantNicks})";

            Console.WriteLine($"\n🪙 {label}: {pot.Amount} fichas{explanation}");

            var eligibleHands = evaluatedHands
                .Where(eh => pot.EligiblePlayers.Contains(eh.Player))
                .ToList();

            Console.WriteLine($"🔍 Evaluando {eligibleHands.Count} jugadores para el {label}:");
            foreach (var hand in eligibleHands)
            {
                Console.WriteLine($"✋ {hand.Player.User.NickName}: {hand.Description}");
            }

            var bestHand = eligibleHands
                .OrderByDescending(e => e, _handComparer)
                .First();

            var winners = eligibleHands
                .Where(e => _handComparer.Compare(e, bestHand) == 0)
                .ToList();

            int winnings = pot.Amount / winners.Count;

            foreach (var winner in winners)
            {
                winner.Player.Win(winnings);
                Console.WriteLine($"{winner.Player.User.NickName} gana {winnings} fichas del {label.ToLower()} con {winner.Description}.");

                _lastShowdownSummary.Add(new
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

            if (pot.Amount % winners.Count != 0)
            {
                Console.WriteLine($"{pot.Amount % winners.Count} ficha(s) no pudieron ser repartidas equitativamente.");
            }
        }

        _pots.Clear();

        foreach (var player in _gameMatch.Players)
        {
            if (player.User.Coins <= 0)
            {
                player.PlayerState = PlayerState.Waiting;
                Console.WriteLine($"{player.User.NickName} se ha quedado sin fichas y pasa a modo espera.");
            }
        }
    }



    // Asigna ciegas a los jugadores activos
    public void AssignBlinds()
    {
        Console.WriteLine("\n--- Asigna ciegas a los jugadores activos ---\n");
        _blindManager.AssignBlinds();
    }

    public Player GetDealer() => _blindManager.Dealer;
    public Player GetSmallBlind() => _blindManager.SmallBlind;
    public Player GetBigBlind() => _blindManager.BigBlind;


    // Reparte 3 cartas comunitarias
    public void DealFlop()
    {
        _deck.BurnCard();
        _communityCards.Add(_deck.Draw());
        _communityCards.Add(_deck.Draw());
        _communityCards.Add(_deck.Draw());

        Console.WriteLine("\n--- FLOP ---");

        PokerHelper.ShowCommunityCards(_communityCards);
    }

    // Reparte 1 carta comunitaria
    public void DealTurn()
    {
        _deck.BurnCard();
        _communityCards.Add(_deck.Draw());

        Console.WriteLine("\n--- TURN D ---");

        PokerHelper.ShowCommunityCards(_communityCards);
    }

    // Reparte 1 carta comunitaria
    public void DealRiver()
    {
        _deck.BurnCard();
        _communityCards.Add(_deck.Draw());

        Console.WriteLine("\n--- RIVER  ---");

        PokerHelper.ShowCommunityCards(_communityCards);
    }

    public void AdvanceTurn()
    {
        var activePlayers = _gameMatch.Players
            .Where(p => p.PlayerState == PlayerState.Playing && p.User.Coins > 0)
            .ToList();

        if (activePlayers.Count == 0)
        {
            Console.WriteLine("❌ No hay jugadores activos para avanzar turno.");
            return;
        }

        int currentIndex = _gameMatch.Players.FindIndex(p => p.UserId == _currentTurnUserId);
        int totalPlayers = _gameMatch.Players.Count;

        string phase = GetCurrentPhase(); 

        for (int i = 1; i < totalPlayers; i++)
        {
            int nextIndex = (currentIndex + i) % totalPlayers;
            var nextPlayer = _gameMatch.Players[nextIndex];

            if (nextPlayer.PlayerState != PlayerState.Playing || nextPlayer.User.Coins <= 0)
                continue;

            if (PokerActionTracker.HasPlayerActed(_gameMatch.GameTableId, nextPlayer.UserId, phase))
                continue;

            _currentTurnUserId = nextPlayer.UserId;
            Console.WriteLine($"➡️ Turno avanzado a {nextPlayer.User.NickName} (userId: {_currentTurnUserId})");
            return;
        }

        Console.WriteLine("⚠️ No hay más jugadores que necesiten actuar en esta fase.");
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


    public void StartTurn(Match match)
    {
        List<Player> activePlayers = match.Players
            .Where(p => p.PlayerState == PlayerState.Playing && p.User.Coins > 0)
            .ToList();

        if (!activePlayers.Any())
        {
            Console.WriteLine("⚠️ No hay jugadores activos para iniciar el turno.");
            return;
        }

        var firstToAct = activePlayers.First();
        _currentTurnUserId = firstToAct.UserId;
        Console.WriteLine($"🎯 Primer jugador en actuar: {firstToAct.User.NickName} (userId: {_currentTurnUserId})");
    }



    // Reinicia apuesta de todos los jugadores
    private void ResetCurrentBets()
    {
        foreach (var player in _gameMatch.Players)
        {
            player.CurrentBet = 0;
        }
    }

    // Genera pots (main y side) al final de apuestas
    public void GeneratePots()
    {
        _pots.Clear();

        var playersWithBets = _gameMatch.Players
            .Where(p => p.TotalContribution > 0)
            .OrderBy(p => p.TotalContribution)
            .ToList();

        Console.WriteLine("\n♻️ [GeneratePots] Generando pots...");
        foreach (var p in playersWithBets)
        {
            Console.WriteLine($"   - {p.User.NickName} contribuyó: {p.TotalContribution} fichas");
        }

        while (playersWithBets.Any())
        {
            int minContribution = playersWithBets.First().TotalContribution;
            var pot = new Pot();

            Console.WriteLine($"\n➕ Nuevo pot con contribución mínima: {minContribution}");

            foreach (var player in playersWithBets)
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

        if (_pots.Count == 1)
        {
            Console.WriteLine("✅ Solo se ha generado un Main Pot (todo normal)");
        }
        else
        {
            Console.WriteLine($"⚠️ Se han generado {_pots.Count} pots. Verifica si hubo diferencias en las contribuciones.");
        }
    }


    public void HandlePokerBet(Player player, int amount)
    {
        if (amount == player.User.Coins)
        {
            player.PlayerState = PlayerState.AllIn;
        }

        player.TotalContribution += amount;

        player.PlaceBet(amount);
    }


    public int GetLastBetAmount(int userId)
    {
        var player = _gameMatch.Players.FirstOrDefault(p => p.User.Id == userId);
        return player?.TotalContribution ?? 0;
    }

    public int GetChipResult(int userId)
    {
        var player = _gameMatch.Players.FirstOrDefault(p => p.User.Id == userId);
        return player != null ? player.User.Coins - player.TotalContribution : 0;
    }

    public List<Card> GetCommunityCards()
    {
        return _communityCards;
    }

    public List<Player> GetActivePlayers()
    {
        return _gameMatch.Players
            .Where(p => p.PlayerState == PlayerState.Playing || p.PlayerState == PlayerState.AllIn)
            .ToList();
    }


    public List<object> GetShowdownSummary()
    {
        return _lastShowdownSummary;
    }


}

