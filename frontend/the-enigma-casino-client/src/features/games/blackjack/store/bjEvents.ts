import { createEvent } from "effector";
import { Player, Croupier, GameState } from "../../shared/types";
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
export const matchStarted = createEvent<MatchStartedPayload>();// borrar?
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

// Acciones enviadas al backend
export const playerHit = createEvent();
export const playerStand = createEvent();
export const doubleDown = createEvent();
export const playerPlaceBet = createEvent<number>();

// Mensajes entrantes del backend
export const gameStateReceived = createEvent<any>();
export const betConfirmed = createEvent<any>();
export const errorReceived = createEvent<string>();

