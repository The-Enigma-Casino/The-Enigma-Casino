import { createEvent } from "effector";

export const setGameType = createEvent<number>();
export const joinTableClicked = createEvent<number>();
export const leaveTableClicked = createEvent();
export const sendLeaveTableMessage = createEvent();
export const countdownCleared = createEvent<number>();
export const countdownTicked = createEvent();
export const messageSent = createEvent<string>();
export const markLeftTable = createEvent();
export const tryJoinTable = createEvent<number>();
