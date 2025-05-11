import { createEvent, createStore, sample } from "effector";
import { BigWin } from "../interfaces/bigWin.interface";
import { fetchBigWinsFx } from "../actions/bigWins.action";

export const loadBigWins = createEvent<void>();
export const resetBigWins = createEvent<void>();

export const $bigWins = createStore<BigWin[]>([])
  .on(fetchBigWinsFx.doneData, (_, bigWins) => bigWins)
  .reset(resetBigWins);

sample({
  clock: loadBigWins,
  target: fetchBigWinsFx,
});
