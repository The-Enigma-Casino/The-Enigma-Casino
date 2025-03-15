import { createEvent, createStore, sample } from "effector";
import { CoinsPack } from "../models/CoinsPack.interface";
import { getCoinsPacksFx } from "../actions/catalogActions";

// Evento para seleccionar una tarjeta
export const selectCard = createEvent<any>();

export const loadPack = createEvent<any>();

export const resetPayment = createEvent();

// Evento para seleccionar un método de pago
export const selectPaymentMethod = createEvent<string>();

// GET coins packs
export const $coinsPacks = createStore<CoinsPack[]>([])
  .on(getCoinsPacksFx.doneData, (_, packs) => packs)
  .on(getCoinsPacksFx.failData, (_, error) => {
    console.error("Error al obtener los packs de monedas:", error);
    return [];
  });

// Store que guarda la tarjeta seleccionada
export const $selectedCard = createStore<any>(null)
  .on(selectCard, (_, card) => card)
  .reset(resetPayment);

// Store que guarda el método de pago seleccionado
export const $paymentMethod = createStore<string | null>("Stripe")
  .on(selectPaymentMethod, (_, method) => method)
  .reset(resetPayment);


sample({
  clock: loadPack,
  target: getCoinsPacksFx,
});
