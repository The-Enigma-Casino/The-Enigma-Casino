import { createStore, createEvent } from "effector";

export const setPaymentMethod = createEvent<string>();
export const $paymentMethod = createStore<string>("stripe").on(
  setPaymentMethod,
  (_, method) => method
);
