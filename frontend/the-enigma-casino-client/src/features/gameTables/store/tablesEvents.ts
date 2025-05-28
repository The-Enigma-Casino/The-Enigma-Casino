import { createEvent } from "effector";
import { Player } from "../models/GameTable.interface";

export const tableUpdated = createEvent<{
  tableId: number;
  players: (Player | null)[];
  state: string;
}>();

export const countdownStarted = createEvent<{
  tableId: number;
  countdown: number;
}>();

export const countdownStopped = createEvent<{ tableId: number }>();
export const gameStarted = createEvent<{ tableId: number }>();
export const errorReceived = createEvent<string>();

export const setGameType = createEvent<number>();
export const joinTableClicked = createEvent<number>();
export const leaveTableClicked = createEvent();
export const sendLeaveTableMessage = createEvent();
export const countdownCleared = createEvent<number>();
export const countdownTicked = createEvent();
export const messageSent = createEvent<string>();
export const markLeftTable = createEvent();
export const tryJoinTable = createEvent<number>();
export const resetTableId = createEvent();
export const matchStarted = createEvent<number>();
export const exitLobbyPage = createEvent();
export const tableWaitingOpponent = createEvent<number>();
export const clearWaitingOpponent = createEvent();
// export const tableConfirmedJoin = createEvent<number>();
// export const resetConfirmedJoin = createEvent();

// Friend
export const setPendingJoinTableId = createEvent<number>();
export const clearPendingJoinTableId = createEvent();

