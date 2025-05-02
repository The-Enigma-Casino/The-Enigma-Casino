import { createStore } from "effector";
import {
  countdownCleared,
  countdownTicked,
  exitLobbyPage,
  joinTableClicked,
  leaveTableClicked,
  markLeftTable,
  matchStarted,
  resetTableId,
  setGameType,
} from "./tablesIndex";
import { GameTable } from "../models/GameTable.interface";
import {
  countdownStarted,
  countdownStopped,
  gameStarted,
  tableUpdated,
} from "../models/GameTable.handlers";
import { fetchTables } from "../actions/tableActions";

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
  });

export const $hasLeftTable = createStore(false)
  .on(markLeftTable, () => true)
  .reset([joinTableClicked, leaveTableClicked]);


  export const $isInLobby = createStore(false)
  .on(joinTableClicked, () => true)
  .on(matchStarted, () => false)
  .on(leaveTableClicked, () => false)
  .on(resetTableId, () => false)
  .on(exitLobbyPage, () => false);
