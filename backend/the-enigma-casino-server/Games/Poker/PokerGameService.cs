using the_enigma_casino_server.Games.Shared.Entities;
using the_enigma_casino_server.Games.Shared.Enum;

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
    }

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

    // Jugada final de la ronda: Muestra manos, evalua ganadores y reparte los botes
    public void Showdown()
    {
        Console.WriteLine("\n--- Showdown ---");
        Console.WriteLine("Cartas comunitarias:");
        foreach (var card in _communityCards)
        {
            Console.WriteLine(card);
        }

        var activePlayers = _gameMatch.Players
            .Where(p => p.PlayerState == PlayerState.Playing || p.PlayerState == PlayerState.AllIn)
            .ToList();

        if (!activePlayers.Any())
        {
            Console.WriteLine("No hay jugadores activos para el showdown.");
            return;
        }

        if (activePlayers.Count == 1)
        {
            var winner = activePlayers.First();
            winner.Win(_pots.Sum(p => p.Amount));
            Console.WriteLine($"\n{winner.User.NickName} gana automáticamente el bote de {_pots.Sum(p => p.Amount)} fichas (único jugador activo).");
            _pots.Clear();
            return;
        }

        // Cartas de jugadores activos
        Console.WriteLine("\nCartas de los jugadores:");
        var evaluatedHands = new List<EvaluatedHand>();

        foreach (var player in activePlayers)
        {
            // Junta cartas del jugador + comunitarias
            var allCards = player.Hand.Cards.Concat(_communityCards).ToList();
            Console.WriteLine($"\n {player.User.NickName}: {string.Join(", ", player.Hand.Cards)}");

            // Evalua la mejor mano de cada jugador
            var eval = PokerHandEvaluator.Evaluate(player, allCards);
            evaluatedHands.Add(eval);
            Console.WriteLine($"Evaluación: {eval.Description}"); // Ejemplo: Full House de: Reyes y Dieces
        }

        Console.WriteLine("\n Repartiendo los botes:");

        // Todos los botes (Main pot y side pot)
        for (int i = 0; i < _pots.Count; i++)
        {
            // Etiqueta segn tipo de bote
            var pot = _pots[i];
            string label = _pots.Count == 1
                ? "Pot"
                : i == 0 ? "Main Pot" : $"Side Pot {i}";

            var participantNicks = string.Join(", ", pot.EligiblePlayers.Select(p => p.User.NickName));
            string explanation = label.StartsWith("Side Pot")
                ? $" (sólo {participantNicks} apuesta más que los demás)"
                : $" (Participan: {participantNicks})";

            Console.WriteLine($"\n{label}: {pot.Amount} fichas{explanation}");

            // Manos que participan en ese pot!!
            var eligibleHands = evaluatedHands
                .Where(eh => pot.EligiblePlayers.Contains(eh.Player))
                .ToList();

            // Mejor mano de eligibleHands
            var bestHand = eligibleHands
                .OrderByDescending(e => e, _handComparer)
                .First();

            // Verifica si hay empate o multiple ganadores
            var winners = eligibleHands
                .Where(e => _handComparer.Compare(e, bestHand) == 0)
                .ToList();

            int winnings = pot.Amount / winners.Count;

            foreach (var winner in winners)
            {
                winner.Player.Win(winnings);
                Console.WriteLine($"{winner.Player.User.NickName} gana {winnings} fichas del {label.ToLower()} con {winner.Description}.");
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

    // Pregunta a cada jugador que accion elegir. startingBet - Apuesta inicial, starIndex - Jugador que empieza ronda segun ciegas
    public void BettingRound(int startingBet = 0, int startIndex = 0)
    {
        Console.WriteLine("\n--- Ronda de Apuestas ---");

        int highestBet = startingBet; // Apuesta mas alta a igualar
        bool hasChanged = true; // Si alguien hace raise cambia

        // Ordena jugadores de izquierda a derecha
        var orderedPlayers = _gameMatch.Players
            .Skip(startIndex)
            .Concat(_gameMatch.Players.Take(startIndex))
            .Where(p => p.PlayerState == PlayerState.Playing || p.PlayerState == PlayerState.AllIn)
            .ToList();

        // Si el jugador ha jugado tras igualar
        var alreadyActed = new Dictionary<int, bool>();
        foreach (var p in orderedPlayers)
            alreadyActed[p.User.Id] = false;

        while (hasChanged)
        {
            hasChanged = false;

            // Si todos están en All-In, no hay mas acciones que hacer
            if (orderedPlayers.All(p => p.PlayerState == PlayerState.AllIn || p.User.Coins == 0))
            {
                Console.WriteLine("Todos los jugadores están en All-In o sin fichas. No se requieren más apuestas.");
                break;
            }

            foreach (var player in orderedPlayers)
            {
                if (player.PlayerState == PlayerState.AllIn)
                {
                    Console.WriteLine($"{player.User.NickName} está en All-In y no puede realizar más acciones.");
                    continue;
                }

                if (player.PlayerState != PlayerState.Playing)
                    continue;

                if (player.User.Coins == 0)
                {
                    Console.WriteLine($"{player.User.NickName} está sin fichas y no puede realizar acciones.");
                    continue;
                }

                if (player.CurrentBet == highestBet && alreadyActed[player.User.Id])
                {
                    Console.WriteLine($"{player.User.NickName} ya está igualado.");
                    continue;
                }

                Console.WriteLine($"\n{player.User.NickName}, tienes {player.User.Coins} fichas.");
                Console.WriteLine($"Apuesta actual: {player.CurrentBet}, Mayor apuesta: {highestBet}");
                string action;
                do
                {
                    Console.Write("Acción [check, call, raise, all-in, fold]: ");
                    action = Console.ReadLine()?.Trim().ToLower();
                }
                while (action != "check" && action != "call" && action != "raise" && action != "all-in" && action != "fold"); ;

                switch (action)
                {
                    case "check": // Pasar
                        if (player.CurrentBet < highestBet)
                        {
                            Console.WriteLine("No puedes hacer check. Hay una apuesta más alta.");

                            // Volver a pedir acción sin avanzar al siguiente jugador
                            string newAction;
                            List<string> validOptions = new() { "call", "raise", "all-in", "fold" }; // sin check
                            do
                            {
                                Console.Write($"Acción [{string.Join(", ", validOptions)}]: ");
                                newAction = Console.ReadLine()?.Trim().ToLower();
                            }
                            while (!validOptions.Contains(newAction));

                            action = newAction; // Cambiar la acción para que se reevalúe
                            goto case "call";   // O salta al case correspondiente (podrías usar un bucle si prefieres)
                        }

                        Console.WriteLine($"{player.User.NickName} pasa (check).");
                        alreadyActed[player.User.Id] = true;
                        break;

                    case "call": // Ver apuesta (igualar)
                        int toCall = highestBet - player.CurrentBet;

                        if (toCall > player.User.Coins)
                        {
                            Console.WriteLine($"No tienes suficientes fichas para igualar ({toCall} fichas). Tienes {player.User.Coins} fichas.");
                            Console.Write("¿Quieres ir All-In con tus fichas disponibles? (s/n): ");
                            var input = Console.ReadLine()?.Trim().ToLower();

                            if (input == "s")
                            {
                                int allIn = player.User.Coins;
                                int prevBet = player.CurrentBet;

                                HandlePokerBet(player, allIn);
                                _pot += player.CurrentBet - prevBet;
                                alreadyActed[player.User.Id] = true;

                                Console.WriteLine($"{player.User.NickName} va All-In con {allIn} fichas.");
                                break;
                            }
                            else
                            {
                                Console.WriteLine($"{player.User.NickName} se retira.");
                                player.PlayerState = PlayerState.Fold;
                                continue;
                            }
                        }

                        // Si puede igualar normalmente
                        int prevBetCall = player.CurrentBet;
                        //player.PlaceBet(toCall, allowAllIn: true);
                        HandlePokerBet(player, toCall);
                        _pot += player.CurrentBet - prevBetCall;

                        alreadyActed[player.User.Id] = true;

                        if (toCall == 0)
                            Console.WriteLine($"{player.User.NickName} ya está igualado.");
                        else
                            Console.WriteLine($"{player.User.NickName} iguala con {toCall} fichas.");
                        break;


                    case "raise": // Subir apuesta
                        Console.Write("¿Cuánto deseas subir?: ");
                        if (int.TryParse(Console.ReadLine(), out int raiseAmount))
                        {
                            if (raiseAmount <= 0)
                            {
                                Console.WriteLine("La subida debe ser mayor que cero.");
                                continue;
                            }

                            int toCallRaise = highestBet - player.CurrentBet;
                            int totalBet = toCallRaise + raiseAmount;

                            if (totalBet > player.User.Coins)
                            {
                                Console.WriteLine("No tienes suficientes fichas. Te retiras automáticamente.");
                                player.PlayerState = PlayerState.Fold;
                                continue;
                            }

                            int prevBetRaise = player.CurrentBet;
                            //player.PlaceBet(totalBet, allowAllIn: true);
                            HandlePokerBet(player, totalBet);
                            int amountAdded = player.CurrentBet - prevBetRaise;

                            highestBet = player.CurrentBet;
                            _pot += amountAdded;
                            hasChanged = true;
                            alreadyActed[player.User.Id] = true;

                            Console.WriteLine($"{player.User.NickName} hace raise a {player.CurrentBet} fichas (sube {raiseAmount} sobre la apuesta actual).");
                        }
                        else
                        {
                            Console.WriteLine("Cantidad no válida. Te retiras automáticamente.");
                            player.PlayerState = PlayerState.Fold;
                        }
                        break;

                    case "all-in": // Apostar todas tus fichas
                        int allInAmount = player.User.Coins;
                        int prevAllInBet = player.CurrentBet;

                        HandlePokerBet(player, allInAmount);
                        _pot += player.CurrentBet - prevAllInBet;

                        Console.WriteLine($"{player.User.NickName} va All-In con {allInAmount} fichas.");

                        if (player.CurrentBet > highestBet)
                        {
                            highestBet = player.CurrentBet;
                            hasChanged = true;
                        }

                        alreadyActed[player.User.Id] = true;
                        break;

                    case "fold": // Retirarse
                        Console.WriteLine($"{player.User.NickName} se retira.");
                        player.PlayerState = PlayerState.Fold;
                        break;

                    default:
                        Console.WriteLine("Acción no válida. Te retiras automáticamente.");
                        player.PlayerState = PlayerState.Fold;
                        break;
                }
            }

            Console.WriteLine($"\nBOTE acumulado: {_pot} fichas.");
        }
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
    private void GeneratePots()
    {
        _pots.Clear();

        // Ordena a los jugadores que han apostado por menor cantidad 
        var playersWithBets = _gameMatch.Players
            .Where(p => p.TotalContribution > 0)
            .OrderBy(p => p.TotalContribution)
            .ToList();

        while (playersWithBets.Any())
        {
            int minContribution = playersWithBets.First().TotalContribution; // El minimo que han apostado
            var pot = new Pot(); // Nuevo pot

            foreach (var player in playersWithBets)
            {
                int contribution = Math.Min(minContribution, player.TotalContribution);
                pot.AddChips(contribution); // Suma al pot
                player.TotalContribution -= contribution; // Resta lo aportado a su total
                pot.AddEligiblePlayer(player); // Jugadores que optan a ganar el pot
            }

            _pots.Add(pot);

            playersWithBets = playersWithBets
                .Where(p => p.TotalContribution > 0)
                .OrderBy(p => p.TotalContribution)
                .ToList();
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

    // Juego completo
    public void PlayRound()
    {
        Console.WriteLine("\n----------------------");
        Console.WriteLine("    NUEVA RONDA DE POKER");
        Console.WriteLine("----------------------");

        _pot = 0;
        // 1. Reparte cartas privadas a cada jugador activo
        StartRound();

        // 2. Asigna Ciegas
        _blindManager.AssignBlinds();

        // 3. Pre-Flop (antes del flop)
        Console.WriteLine("\n======== [PRE-FLOP] ========");
        BettingRound(BigBlindAmount, _blindManager.FirstToActIndex); // FirstoAtIndex representa al jugador que esta despues de la ciega grande
        ResetCurrentBets();

        // 4. Flop (Se reparten 3 cartas comunitarias)
        DealFlop();
        Console.WriteLine("\n======== [FLOP] ========");
        BettingRound(0, _blindManager.SmallBlindIndex);
        ResetCurrentBets();

        // 5. Turn (Se reparte 1 carta comunitaria)
        DealTurn();
        Console.WriteLine("\n======== [TURN] ========");
        BettingRound(0, _blindManager.SmallBlindIndex);
        ResetCurrentBets();

        // 6. River (Se reparte 1 carta comunitaria)
        DealRiver();
        Console.WriteLine("\n======== [RIVER] ========");
        BettingRound(0, _blindManager.SmallBlindIndex);

        // 7. Separa botes depende las fichas apostadas
        GeneratePots();
        ResetCurrentBets();

        // 8. Evalua manos y reparte los botes
        Console.WriteLine("\n======== [SHOWDOWN] ========");
        Showdown();

        // 9. Rotar dealer para siguiente ronda
        _blindManager.NextDealer();
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

}

