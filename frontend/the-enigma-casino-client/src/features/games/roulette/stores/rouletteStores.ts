import { createStore } from "effector";
import {
  gameStateReceived,
  spinResultReceived,
  betsOpenedReceived,
  betsClosedReceived,
  roulettePausedReceived,
  resetSpinResult,
  countdownTick,
} from "./rouletteEvents";

export const rouletteGameState$ = createStore<any>(null).on(
  gameStateReceived,
  (_, payload) => payload
);

export const spinResult$ = createStore<any>(null)
  .on(spinResultReceived, (_, payload) => {
    if (payload?.result && typeof payload.result.number === "number") {
      return payload.result;
    }
    console.warn("⚠️ spinResult inválido recibido:", payload);
    return null;
  })
  .on(betsOpenedReceived, () => null)
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
