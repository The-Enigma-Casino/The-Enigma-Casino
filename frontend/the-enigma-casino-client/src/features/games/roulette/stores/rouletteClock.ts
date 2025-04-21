import { createStore, createEvent, sample } from "effector";
import { countdownTick } from "./rouletteEvents";

export const countdownStart = createEvent<number>();

export const countdownDecrement = createEvent();

export const syncedCountdown$ = createStore(0)
  .on(countdownStart, (_, seconds) => seconds)
  .on(countdownDecrement, (state) => Math.max(state - 1, 0));

sample({
  clock: countdownTick,
  target: countdownStart,
});
