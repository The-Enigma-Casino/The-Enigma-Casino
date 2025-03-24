import { createEvent, createStore } from "effector";
import { fetchTables } from "../actions/tableActions";

export const setGameType = createEvent<number>();

export const $gameType = createStore<number>(0).on(setGameType, (_, newType) => newType);

export const $tables = createStore<any[]>([])
  .on(fetchTables.doneData, (_, tables) => tables);

$gameType.watch(fetchTables);
