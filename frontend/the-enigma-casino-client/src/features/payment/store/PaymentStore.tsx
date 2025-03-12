import { createStore } from "effector";
import { fetchLastOrderFx, fetchLastOrderIdFx } from "../actions/orderActions";
import {
  fetchClientSecretFx,
  fetchPaymentStatusFx,
} from "../actions/stripeActions";
import { OrderDto } from "../models/OrderDto.interface";

export const $clientSecret = createStore<string | null>(null).on(
  fetchClientSecretFx.doneData,
  (_, data) => {
    console.log("Actualizando store con clientSecret:", data);
    return data.clientSecret; // 🔹 Aquí asegúrate de que la API devuelve { clientSecret: "valor" }
  }
);

export const $lastOrder = createStore<OrderDto | null>(null)
  .on(fetchLastOrderFx.doneData, (_, order) => {
    console.log("💾 Actualizando $lastOrder con:", order);
    return order;
  })
  .reset(fetchLastOrderFx.fail);

export const $lastOrderId = createStore<number | null>(null)
  .on(fetchLastOrderIdFx.doneData, (_, id) => id)
  .reset(fetchLastOrderIdFx.fail);

export const $paymentStatus = createStore<string | null>(null)
  .on(fetchPaymentStatusFx.doneData, (_, paymentStatus) => {
    console.log("💾 Guardando estado del pago en Effector:", paymentStatus);
    return paymentStatus; //
  })
  .reset(fetchPaymentStatusFx.fail);

export const $paymentError = createStore<string | null>(null)
  .on(fetchPaymentStatusFx.failData, (_, error) => error.message)
  .reset(fetchPaymentStatusFx.done);
