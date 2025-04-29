import { createEvent, sample } from "effector";
import { navigateTo } from "../../shared/router/navigateFx";

export const gameStateReceived = createEvent<any>();
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

export type PlaceRouletteBetPayload = {
  tableId: string;
  amount: number;
  betType: "Straight" | "Color" | "EvenOdd" | "Dozen" | "Column" | "HighLow";
  number?: number;
  color?: "red" | "black";
  evenOdd?: "Even" | "Odd";
  dozen?: 1 | 2 | 3;
  column?: 1 | 2 | 3;
  highLow?: "High" | "Low";
};

export const rouletteStopedReceived = createEvent();

export const matchReadyReceived = createEvent<number>();


sample({
  clock: matchReadyReceived,
  fn: (tableId) => {
    const path = `/game/roulette/${tableId}`;
    return path;
  },
  target: navigateTo,
});
