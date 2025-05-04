import { createEvent } from "effector";
import { RoulettePlayer } from "../types/roulettePlayer.type";

export const requestWheelState = createEvent<number>();

export const gameStateReceived = createEvent<{
  tableId: number;
  canPlaceBets: boolean;
  wheelRotation?: number;
  players: {
    nickName: string;
    bets: { bet: string; amount: number }[];
  }[];
}>();

export const spinResultReceived = createEvent<any>();

export const betConfirmed = createEvent<any>();

export const betsOpenedReceived = createEvent();

export const betsClosedReceived = createEvent();

export const roulettePausedReceived = createEvent();

export const playerPlaceBet = createEvent<any>();

export const requestGameState = createEvent<number>();

export const resetGameState = createEvent();

export const placeRouletteBet = createEvent<{
  tableId: string;
  amount: number;
  betType:
    | "Straight"
    | "Color"
    | "EvenOdd"
    | "Dozen"
    | "Column"
    | "HighLow";
  number?: number;
  color?: "red" | "black";
  evenOdd?: "Even" | "Odd";
  dozen?: 1 | 2 | 3;
  column?: 1 | 2 | 3;
  highLow?: "High" | "Low";
}>();

export const resetSpinResult = createEvent();

export const countdownTick = createEvent<number>();

export const rouletteStopedReceived = createEvent();

export const matchReadyReceived = createEvent<number>();

export const setRoulettePlayers = createEvent<RoulettePlayer[]>();

export const resetRoulettePlayers = createEvent();

export const playerKickedReceived = createEvent<{ message: string }>();

export const countdownStart = createEvent<number>();

export const countdownDecrement = createEvent();
