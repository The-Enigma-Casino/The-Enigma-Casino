import { createStore, createEvent } from "effector";
import { fetchLastOrderFx, fetchLastOrderIdFx } from "../actions/orderActions";
import { fetchStripePaymentStatusFx } from "../actions/stripeActions";

export const setPaymentMethod = createEvent<string>();
export const $paymentMethod = createStore<string>("stripe").on(
  setPaymentMethod,
  (_, method) => method
);

export const $lastOrder = createStore(null)
  .on(fetchLastOrderFx.doneData, (_, order) => order)
  .reset(fetchLastOrderFx.fail);

export const $lastOrderId = createStore<number | null>(null)
  .on(fetchLastOrderIdFx.doneData, (_, id) => id)
  .reset(fetchLastOrderIdFx.fail);

export const $paymentStatus = createStore<string | null>(null)
  .on(fetchStripePaymentStatusFx.doneData, (_, status) => status)
  .reset(fetchStripePaymentStatusFx.fail);

export const $paymentError = createStore<string | null>(null)
  .on(fetchStripePaymentStatusFx.failData, (_, error) => error.message)
  .reset(fetchStripePaymentStatusFx.done);
