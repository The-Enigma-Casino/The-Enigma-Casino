import { createStore } from "effector";
import {
  gameStateReceived,
  spinResultReceived,
  betsOpenedReceived,
  betsClosedReceived,
  roulettePausedReceived,
  resetSpinResult,
  countdownTick,
  rouletteStopedReceived,
} from "./rouletteEvents";

export const rouletteGameState$ = createStore<any>(null).on(
  gameStateReceived,
  (_, payload) => payload
);

export const spinResult$ = createStore<any>(null)
  .on(spinResultReceived, (_, payload) => {
    if (payload?.result && typeof payload.result.number === "number") {
      return {
        number: payload.result.number,
        color: payload.result.color,
        bets: payload.results ?? [],
      };
    }
    console.warn("⚠️ spinResult inválido recibido:", payload);
    return null;
  })
  .on(betsOpenedReceived, () => null)
  .reset(resetSpinResult);

  export const lastResults$ = createStore<{ number: number; color: string }[]>([])
  .on(spinResultReceived, (state, payload) => {
    if (!payload?.result) return state;
    const newResult = { number: payload.result.number, color: payload.result.color };
    const updated = [...state, newResult];
    if (updated.length > 6) {
      return updated.slice(1);
    }
    return updated;
  })
  .reset(resetSpinResult);

export const betsClosed$ = createStore<boolean>(false)
  .on(betsClosedReceived, () => true)
  .on(betsOpenedReceived, () => false);

export const isPaused$ = createStore<boolean>(false).on(
  roulettePausedReceived,
  () => true
);

export const countdown$ = createStore<number>(0).on(
  countdownTick,
  (_, seconds) => seconds
);

export const isStopped$ = createStore<boolean>(false)
  .on(rouletteStopedReceived, () => true)
  .on(betsOpenedReceived, () => false);
