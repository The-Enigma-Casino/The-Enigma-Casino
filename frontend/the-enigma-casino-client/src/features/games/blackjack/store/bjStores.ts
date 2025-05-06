import { createStore, sample } from "effector";
import {
  setPlayers, setCroupier, setGameState, resetPlayers, resetCroupier, resetGameState, setCurrentTurnUserId, matchStarted, roundResultReceived, resetCroupierRoundHand,
  resetRoundResults, setCroupierRoundHand, resetCroupierTotal,
  setGamePhase, betsOpened, matchCancelled,
  countdownStarted,
  decrementCountdown,
  resetCountdown,
  turnCountdownStarted,
  decrementTurnCountdown,
  resetTurnCountdown,
  turnStarted,
  turnCountdownTicked,
  playerKickedReceived,
  matchReadyReceived,
  localBetPlaced,
  resetBets,
  gameStateReceived
} from "../store/bjEvents";
import { navigateTo } from "../../shared/router/navigateFx";
import { Player, Croupier, GameState } from "../../shared/types";
import { $userId } from "../../../auth/store/authStore";
import toast from "react-hot-toast";


export const $players = createStore<Player[]>([])
  .on(setPlayers, (prevPlayers, newPlayers) =>
    newPlayers.map((newP) => {
      const prev = prevPlayers.find((p) => p.id === newP.id);
      return {
        ...newP,
        bet: newP.bet !== undefined ? newP.bet : prev?.bet ?? 0,
      };
    })
  )
  .on(gameStateReceived, (_, data) =>
    data.players.map((p) => ({
      id: p.userId,
      name: p.nickname,
      hand: p.hand,
      total: p.total,
      state: p.state,
      bet: p.bet ?? 0,
    }))
  )
  .on(resetPlayers, () => [])
  .on(localBetPlaced, (players, amount) =>
    players.map((p) =>
      p.id === Number($userId.getState()) ? { ...p, bet: amount } : p
    )
  )
  .on(resetBets, (players) =>
    players.map((p) => ({ ...p, bet: 0 }))
  );


export const $croupier = createStore<Croupier>({ hand: [] })
  .on(setCroupier, (_, croupier) => croupier)
  .on(resetCroupier, () => ({ hand: [] }));

export const $gameState = createStore<GameState>("Waiting")
  .on(setGameState, (_, state) => state)
  .on(matchStarted, () => "InProgress")
  .on(resetGameState, () => "Waiting");

export const $gamePhase = createStore<
  "waiting" | "countdown" | "betting" | "playing" | "results"
>("waiting");

$gamePhase.on(setGamePhase, (_, phase) => phase);

export const $currentTurnUserId = createStore<number | null>(null)
  .on(setCurrentTurnUserId, (_, id) => id);

$players.on(localBetPlaced, (players, amount) => {
  return players.map(p =>
    p.id === Number($userId.getState()) ? { ...p, bet: amount } : p
  );
});

export const $roundResults = createStore<{
  userId: number;
  nickname: string;
  result: "win" | "lose" | "draw" | "blackjack";
  coinsChange: number;
  finalTotal: number;
}[]>([])
  .on(roundResultReceived, (_, payload) => payload.results)
  .on(resetRoundResults, () => []);

// Croupier
export const $croupierRoundHand = createStore<{
  rank: string;
  suit: string;
  value: number;
}[]>([])
  .on(roundResultReceived, (_, payload) => payload.croupierHand)
  .on(setCroupierRoundHand, (_, cards) => cards)
  .on(resetCroupierRoundHand, () => []);

export const $croupierTotal = createStore<number>(0)
  .on(roundResultReceived, (_, payload) => payload.croupierTotal)
  .on(resetRoundResults, () => 0)
  .on(resetCroupierTotal, () => 0);

// Limpieza general al iniciar partida
matchStarted.watch(() => {
  resetPlayers();
  resetCroupier();
  resetCroupierRoundHand();
  resetCroupierTotal();
  resetGameState();
  resetRoundResults();
});

betsOpened.watch(() => setGamePhase("betting"));
matchCancelled.watch(() => setGamePhase("waiting"));
roundResultReceived.watch(() => setGamePhase("results"));

// Timers
let countdownTimer: ReturnType<typeof setTimeout> | null = null;
let turnTimer: ReturnType<typeof setTimeout> | null = null;

export const $countdown = createStore<number>(30)
  .on(countdownStarted, (_, value) => value)
  .on(decrementCountdown, (count) => (count > 0 ? count - 1 : 0))
  .on(resetCountdown, () => 30);

betsOpened.watch((data) => {
  clearCountdownTimer();
  clearTurnTimer();

  resetTurnCountdown();
  countdownStarted(data.bettingDuration);
  setGamePhase("betting");

  countdownTimer = setInterval(() => {
    decrementCountdown();
  }, 1000);
});

export const $turnCountdown = createStore<number>(20)
  .on(turnCountdownStarted, (_, seconds) => seconds)
  .on(decrementTurnCountdown, (val) => (val > 0 ? val - 1 : 0))
  .on(resetTurnCountdown, () => 20);

turnCountdownTicked.watch(({ userId, localUserId, duration }) => {
  clearTurnTimer();

  if (userId === Number(localUserId)) {
    setGamePhase("playing");
    turnCountdownStarted(duration);

    turnTimer = setInterval(() => {
      decrementTurnCountdown();
    }, 1000);
  } else {
    resetTurnCountdown();
  }
});

matchCancelled.watch(() => {
  clearCountdownTimer();
  clearTurnTimer();
  setGamePhase("waiting");
});

matchStarted.watch(() => {
  clearCountdownTimer();
  clearTurnTimer();
});

function clearCountdownTimer() {
  if (countdownTimer !== null) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
}

function clearTurnTimer() {
  if (turnTimer !== null) {
    clearInterval(turnTimer);
    turnTimer = null;
  }
}

sample({
  source: $userId,
  clock: turnStarted,
  fn: (localUserId, { userId, duration }) => ({
    userId,
    localUserId,
    duration
  }),
  target: turnCountdownTicked
});


// Inactividad
sample({
  source: playerKickedReceived,
  fn: () => {
    toast.error("Has sido expulsado de la mesa por inactividad.");
    return "/";
  },
  target: navigateTo
});

sample({
  source: matchCancelled,
  fn: () => {
    toast("Nadie apostó. La partida ha sido cancelada.");
    return "/";
  },
  target: navigateTo,
});

sample({
  clock: matchReadyReceived,
  fn: (tableId) => {
    const path = `/game/blackjack/${tableId}`;
    return path;
  },
  target: navigateTo,
});

// Reinicio apuesta
betsOpened.watch(() => {
  resetBets();
  setGamePhase("betting");
});

// Guarda apuesta ronda result
export const $persistedBets = createStore<Record<number, number>>({})
  .on(localBetPlaced, (state, amount) => ({
    ...state,
    [Number($userId.getState())]: amount,
  }))
  .on(setPlayers, (state, players) => {
    const updated = { ...state };
    for (const p of players) {
      if (p.bet > 0) updated[p.id] = p.bet;
    }
    return updated;
  })
  .on(resetPlayers, () => ({}));
