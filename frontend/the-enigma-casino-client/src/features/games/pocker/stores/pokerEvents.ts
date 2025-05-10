import { createEvent } from "effector";
import { Card, PlayerPoker, RoundResultPayload } from "../interfaces/poker.interfaces";

export const matchPlayersInitialized = createEvent<PlayerPoker[]>();
export const betConfirmedReceived = createEvent<{ userId: number; bet: number; totalBet: number }>();
export const pokerPhaseChanged = createEvent<"preflop" | "flop" | "turn" | "river" | "showdown">();
export const communityCardsUpdated = createEvent<Card[]>();
export const currentTurnChanged = createEvent<number | null>();
export const validMovesUpdated = createEvent<string[]>();
export const callAmountUpdated = createEvent<number>();
export const maxRaiseUpdated = createEvent<number>();
export const myHandUpdated = createEvent<Card[]>();
export const sendPokerAction = createEvent<{ move: "fold" | "call" | "check" | "raise" | "all-in"; amount?: number }>();
export const myTurnStarted = createEvent();
export const myTurnEnded = createEvent();
export const blindsAssigned = createEvent<{ dealer: { userId: number }; smallBlind: { userId: number; amount: number }; bigBlind: { userId: number; amount: number } }>();
export const pokerMatchCancelled = createEvent();
export const playerKickedReceived = createEvent<{ userId: number }>();

export const roundResultReceived = createEvent<RoundResultPayload>();


export const turnCountdownSet = createEvent<number>();
export const decrementTurnCountdown = createEvent();
export const turnCountdownTotalSet = createEvent<number>();

export const resetPokerGame = createEvent();

export const removedByInactivity = createEvent();
