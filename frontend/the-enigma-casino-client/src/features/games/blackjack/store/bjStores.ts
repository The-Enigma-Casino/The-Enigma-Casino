import { createStore } from "effector";
import {
  setPlayers,
  setCroupier,
  setGameState,
  resetPlayers,
  resetCroupier,
  resetGameState,
  setCurrentTurnUserId,
  matchStarted,
  roundResultReceived,
  resetCroupierRoundHand,
  resetRoundResults,
  setCroupierRoundHand,
  resetCroupierTotal
} from "../store/bjEvents";
import { Player, Croupier, GameState } from "../../shared/types";



export const $players = createStore<Player[]>([])
  .on(setPlayers, (_, players) => players)
  .on(resetPlayers, () => []);

export const $croupier = createStore<Croupier>({ hand: [] })
  .on(setCroupier, (_, croupier) => croupier)
  .on(resetCroupier, () => ({ hand: [] }));

export const $gameState = createStore<GameState>("Waiting")
  .on(setGameState, (_, state) => state)
  .on(matchStarted, () => "InProgress")
  .on(resetGameState, () => "Waiting");

export const $currentTurnUserId = createStore<number | null>(null)
  .on(setCurrentTurnUserId, (_, id) => id);

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
