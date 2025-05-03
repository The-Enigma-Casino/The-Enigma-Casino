import { createEvent, sample } from "effector";
import { Player, Croupier, GameState } from "../../shared/types";
import { getPlayerAvatarsFx } from "../../actions/playerAvatarsAction";
interface MatchStartedPayload {
  tableId: number;
  matchId: number;
  players: string[];
  startedAt: string;
}

type RoundResultPayload = {
  results: {
    userId: number;
    nickname: string;
    result: "win" | "lose" | "draw" | "blackjack";
    coinsChange: number;
    finalTotal: number;
  }[];
  croupierHand: {
    rank: string;
    suit: string;
    value: number;
  }[];
  croupierTotal: number;
};

// Estado recibido del backend
export const setPlayers = createEvent<Player[]>();
export const setCroupier = createEvent<Croupier>();
export const setGameState = createEvent<GameState>();
export const setCurrentTurnUserId = createEvent<number>();
export const matchStarted = createEvent<MatchStartedPayload>();
export const getGameStateRequested = createEvent();


// Para limpiar estado
export const resetPlayers = createEvent();
export const resetCroupier = createEvent();
export const resetGameState = createEvent();
export const roundResultReceived = createEvent<RoundResultPayload>();
export const resetCroupierRoundHand = createEvent();
export const resetRoundResults = createEvent();
export const setCroupierRoundHand = createEvent<{
  rank: string;
  suit: string;
  value: number;
}[]>();
export const resetCroupierTotal = createEvent();
export const betsOpened = createEvent<{
  tableId: number;
  bettingDuration: number;
}>();
export const matchCancelled = createEvent<{
  tableId: number;
  reason: string;
}>();
export const setGamePhase = createEvent<
  "waiting" | "countdown" | "betting" | "playing" | "results"
>();

// Acciones enviadas al backend
export const playerHit = createEvent();
export const playerStand = createEvent();
export const doubleDown = createEvent();
export const playerPlaceBet = createEvent<number>();
export const localBetPlaced = createEvent<number>(); // Actualiza jugador local

// Mensajes entrantes del backend
export const gameStateReceived = createEvent<any>();
export const betConfirmed = createEvent<any>();
export const errorReceived = createEvent<string>();

// Contador
export const countdownStarted = createEvent<number>();
export const decrementCountdown = createEvent();
export const resetCountdown = createEvent();
export const turnCountdownTicked = createEvent<{
  userId: number;
  localUserId: string;
  duration: number;
}>();

// Turn started
export const turnStarted = createEvent<{ userId: number; duration: number }>();
export const turnCountdownStarted = createEvent<number>();
export const decrementTurnCountdown = createEvent();
export const resetTurnCountdown = createEvent();


// Inactividad
export const playerKickedReceived = createEvent<{ message: string }>();

// Redirrecion a pagina de juego
export const matchReadyReceived = createEvent<number>();

// Actualiza jugadores en la partida(usado en GamePlayerCardList.tsx)
sample({
  clock: setPlayers,
  fn: (players) => players.map((p) => p.name),
  target: getPlayerAvatarsFx,
});
