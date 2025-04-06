import { createStore, createEvent } from "effector";
import { TransactionData } from "../models/EthereumTransaction.interface";
import { fetchTransactionEthereumFx, verifyTransactionEthereumFx } from "../actions/ethereumActions";
import { fetchPaymentStatusFx } from "../actions/stripeActions";

export const setWallet = createEvent<string | null>();
export const setTransactionData = createEvent<TransactionData | null>();

export const setLoading = createEvent<boolean>();
export const setTransactionEnd = createEvent<boolean>();
export const setError = createEvent<string>();
export const resetTransactionData = createEvent();
export const resetError = createEvent();


export const $wallet = createStore<string | null>(null).on(setWallet, (_, wallet) => wallet);

export const $transactionData = createStore<any | null>(null)
  .on(fetchTransactionEthereumFx.doneData, (_, data) => data)  // Si la transacción es exitosa
  .reset(resetTransactionData);

export const $verifyTransactionData = createStore<any | null>(null)
  .on(verifyTransactionEthereumFx.doneData, (_, data) => data);

export const $loading = createStore<boolean>(false)
  .on(setLoading, (_, loading) => loading);

export const $transactionEnd = createStore<boolean>(false)
  .on(setTransactionEnd, (_, end) => end);

export const $error = createStore<string | null>(null)
  .on(fetchTransactionEthereumFx.failData, (_, error) => error.message)
  .reset(fetchTransactionEthereumFx.done)
  .on(resetError, () => null);

export const $paymentError = createStore<string | null>(null)
  .on(fetchPaymentStatusFx.failData, (_, error) => error.message)
  .reset(fetchPaymentStatusFx.done);

verifyTransactionEthereumFx.doneData.watch(() => {
  setTransactionEnd(true);
  setLoading(false);
});

verifyTransactionEthereumFx.failData.watch((error) => {
  setError(error.message);
  setLoading(false);
});
