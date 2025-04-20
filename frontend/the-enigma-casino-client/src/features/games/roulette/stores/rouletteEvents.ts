import { createEvent } from "effector";


export const gameStateReceived = createEvent<any>();
export const spinResultReceived = createEvent<any>();
export const betConfirmed = createEvent<any>();


export const betsOpenedReceived = createEvent();
export const betsClosedReceived = createEvent();
export const roulettePausedReceived = createEvent();


export const playerPlaceBet = createEvent<any>();
export const requestGameState = createEvent<number>();


export const resetGameState = createEvent();
