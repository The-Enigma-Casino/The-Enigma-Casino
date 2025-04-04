import { createEvent, createStore } from "effector";
import { fetchLastOrderFx, fetchLastOrderIdFx } from "../actions/orderActions";
import {
  fetchClientSecretFx,
  fetchPaymentStatusFx,
} from "../actions/stripeActions";
import { OrderDto } from "../models/OrderDto.interface";

export const $clientSecret = createStore<string | null>(null).on(
  fetchClientSecretFx.doneData,
  (_, data) => {
    return data.clientSecret;
  }
);

export const resetLastOrder = createEvent();
export const resetPaymentStatus = createEvent();

export const $lastOrder = createStore<OrderDto | null>(null)
  .on(fetchLastOrderFx.doneData, (_, order) => {
    return order;
  })
  .reset(fetchLastOrderFx.fail)
  .reset(resetLastOrder);

export const $lastOrderId = createStore<number | null>(null)
  .on(fetchLastOrderIdFx.doneData, (_, id) => id)
  .reset(fetchLastOrderIdFx.fail);

export const $paymentStatus = createStore<string | null>(null)
  .on(fetchPaymentStatusFx.doneData, (_, paymentStatus) => {
    return paymentStatus; //
  })
  .reset(fetchPaymentStatusFx.fail)
  .reset(resetPaymentStatus);

export const $paymentError = createStore<string | null>(null)
  .on(fetchPaymentStatusFx.failData, (_, error) => error.message)
  .reset(fetchPaymentStatusFx.done);
