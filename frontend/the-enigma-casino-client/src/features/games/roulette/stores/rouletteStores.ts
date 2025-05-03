import { createStore, sample } from "effector";
import {
  gameStateReceived,
  spinResultReceived,
  betsOpenedReceived,
  betsClosedReceived,
  roulettePausedReceived,
  resetSpinResult,
  countdownTick,
  rouletteStopedReceived,
  resetRoulettePlayers,
} from "./rouletteEvents";
import { RoulettePlayer } from "../types/roulettePlayer.type";
import { LocalBet } from "../types/localBet.type";
import { $name } from "../../../auth/store/authStore";
import { mapBetLabelToKey } from "../utils/buildBetPayload";

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
        wheelRotation: payload.result.wheelRotation,
        ballRotation: payload.result.ballRotation,
        bets: payload.results ?? [],
      };
    }
    return null;
  })
  .on(betsOpenedReceived, () => null)
  .reset(resetSpinResult);

export const lastResults$ = createStore<{ number: number; color: string }[]>([])
  .on(spinResultReceived, (state, payload) => {
    if (!payload?.result) return state;
    const newResult = {
      number: payload.result.number,
      color: payload.result.color,
    };
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

export const roulettePlayers$ = createStore<RoulettePlayer[]>([])
  .on(
    gameStateReceived,
    (_, payload: { players: RoulettePlayer[] }) => payload.players
  )
  .reset(resetRoulettePlayers);

export const $myInitialBets = createStore<LocalBet[]>([]);

sample({
  clock: gameStateReceived,
  source: $name,
  fn: (currentName, payload): LocalBet[] => {
    const current = payload.players.find(
      (p) => p.nickName.toLowerCase() === currentName?.toLowerCase()
    );
    if (!current) return [];
    return current.bets.map((b) => ({
      key: mapBetLabelToKey(b.bet),
      label: b.bet,
      amount: b.amount,
    }));
  },
  target: $myInitialBets,
});

export const wheelRotation$ = createStore<number>(0).on(
  gameStateReceived,
  (_, payload) => payload?.wheelRotation ?? 0
);
