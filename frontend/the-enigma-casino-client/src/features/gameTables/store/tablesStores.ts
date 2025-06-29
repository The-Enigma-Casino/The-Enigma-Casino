import { combine, createStore } from "effector";
import {
  clearJoinProtection,
  clearPendingJoinTableId,
  clearWaitingOpponent,
  countdownCleared,
  countdownStarted,
  countdownStopped,
  countdownTicked,
  exitLobbyPage,
  gameStarted,
  joinTableClicked,
  leaveTableClicked,
  markLeftTable,
  matchStarted,
  resetTableId,
  setGameType,
  setPendingJoinTableId,
  tableCleanupCompleted,
  tableUpdated,
  tableWaitingOpponent,
} from "./tablesEvents";
import { GameTable } from "../models/GameTable.interface";

import { fetchTables } from "../actions/tableActions";
import { $activePlayers } from "./activePlayers.store";

type EnrichedPlayer = {
  name: string;
  avatar: string;
  userId: number | null;
};

export const $gameType = createStore<number>(0).on(
  setGameType,
  (_, newType) => newType
);

export const $currentTableId = createStore<number | null>(null)
  .on(joinTableClicked, (_, tableId) => tableId)
  .on(leaveTableClicked, () => null)
  .reset(resetTableId);

export const $tables = createStore<GameTable[]>([])
  .on(fetchTables.doneData, (_, tables) => tables)
  .on(tableUpdated, (tables, updatedTable) =>
    tables.map((table) =>
      table.id === updatedTable.tableId
        ? { ...table, players: updatedTable.players, state: updatedTable.state }
        : table
    )
  );

export const $countdowns = createStore<{ [tableId: number]: number }>({})
  .on(countdownStarted, (state, payload) => ({
    ...state,
    [payload.tableId]: payload.countdown,
  }))
  .on(countdownStopped, (state, payload) => {
    const newState = { ...state };
    delete newState[payload.tableId];
    return newState;
  })
  .on(gameStarted, (state, payload) => {
    const newState = { ...state };
    delete newState[payload.tableId];
    return newState;
  })
  .on(countdownCleared, (state, tableId) => {
    const newState = { ...state };
    delete newState[tableId];
    return newState;
  })
  .on(countdownTicked, (state) => {
    const newState: typeof state = {};
    for (const [tableId, seconds] of Object.entries(state)) {
      const newValue = seconds - 1;
      if (newValue > 0) {
        newState[Number(tableId)] = newValue;
      }
    }
    return newState;
  })
  .reset(exitLobbyPage);

export const $hasLeftTable = createStore(false)
  .on(markLeftTable, () => true)
  .reset([joinTableClicked, leaveTableClicked, exitLobbyPage]);

export const $isInLobby = createStore(false)
  .on(joinTableClicked, () => true)
  .on(matchStarted, () => false)
  .on(leaveTableClicked, () => false)
  .on(resetTableId, () => false)
  .on(exitLobbyPage, () => false);

export const $pendingJoinTableId = createStore<number | null>(null) // Friend
  .on(setPendingJoinTableId, (_, id) => id)
  .on(clearPendingJoinTableId, () => null);

export const $waitingOpponentTableId = createStore<number | null>(null)
  .on(tableWaitingOpponent, (_, id) => id)
  .reset([
    joinTableClicked,
    leaveTableClicked,
    resetTableId,
    clearWaitingOpponent,
    exitLobbyPage,
  ]);

export const $joiningTableId = createStore<number | null>(null)
  .on(joinTableClicked, (_, id) => id)
  .reset([
    resetTableId,
    markLeftTable,
    leaveTableClicked,
    tableCleanupCompleted,
  ]);

// Protección contra doble join
const joinedTableUsers = new Set<number>();

export function markUserAsJoining(userId: number) {
  joinedTableUsers.add(userId);
}

export function hasUserAlreadyJoined(userId: number): boolean {
  return joinedTableUsers.has(userId);
}

export function unmarkUserAsJoined(userId: number) {
  joinedTableUsers.delete(userId);
}

clearJoinProtection.watch(() => {
  joinedTableUsers.clear();
});

export const $tablePlayers = combine(
  $tables,
  $currentTableId,
  (tables, currentId) => {
    const table = tables.find((t) => t.id === currentId);
    return table?.players ?? [];
  }
);

export const $playersInTable = $activePlayers.map((players) => {
  const map: Record<number, EnrichedPlayer[]> = {};

  for (const p of players) {
    if (!p.tableId) continue;

    if (!map[p.tableId]) {
      map[p.tableId] = [];
    }

    map[p.tableId].push({
      name: p.nickName,
      avatar: p.image || "user_default.webp",
      userId: p.userId,
    });
  }

  return map;
});