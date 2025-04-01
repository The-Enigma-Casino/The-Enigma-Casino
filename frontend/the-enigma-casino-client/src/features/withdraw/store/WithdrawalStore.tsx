import { createEvent, createStore } from "effector"
import { fetchWithrawalFx } from "../actions/withdrawalActions"

// EVENTS
export const resetWithdrawalData = createEvent();
export const resetError = createEvent();
export const setTransactionEnd = createEvent();
export const setLoading = createEvent<boolean>();

// STORE
export const $withdrawalData = createStore<any>(null)
  .on(fetchWithrawalFx.doneData, (_, data) => data)
  .reset(resetWithdrawalData);

export const $loading = createStore<boolean>(false)
  .on(setLoading, (_, loading) => loading)
  .on(fetchWithrawalFx.pending, () => true)
  .on(fetchWithrawalFx.finally, () => false);

export const $error = createStore<string | null>(null)
  .on(fetchWithrawalFx.failData, (_, error) => error.message)
  .reset(resetError);

export const $transactionEnd = createStore<boolean>(false)
  .on(setTransactionEnd, (_, end) => end);
