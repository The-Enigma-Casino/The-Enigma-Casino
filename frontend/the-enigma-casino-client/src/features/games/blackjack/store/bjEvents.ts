import { createEvent } from "effector";
import { Player, Croupier, GameState } from "../../shared/types";

export const setPlayers = createEvent<Player[]>();
export const setCroupier = createEvent<Croupier>();
export const setGameState = createEvent<GameState>();

export const resetPlayers = createEvent();
export const resetCroupier = createEvent();
export const resetGameState = createEvent();

export const startRound = createEvent();

export const playerHit = createEvent<number>();
export const playerStand = createEvent<number>();
export const doubleDown = createEvent<number>();

export const croupierTurn = createEvent();
export const evaluate = createEvent();
export const resetRound = createEvent();
