import { createEvent, createStore } from "effector";
import { CoinsPack } from "../models/CoinsPack.interface";
import { getCoinsPacksFx } from "../actions/catalogActions";

// Evento para seleccionar una tarjeta
export const selectCard = createEvent<any>();

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
export const $selectedCard = createStore<any>(null).on(selectCard, (_, card) => card);

// Store que guarda el método de pago seleccionado
export const $paymentMethod = createStore<string | null>("Stripe").on(selectPaymentMethod, (_, method) => method);

// Mostrar en consola cuando cambia la tarjeta seleccionada
$selectedCard.watch((card) => {
  console.log("Datos seleccionados:", card);
});

$paymentMethod.watch((method) => {
  console.log("Método de pago seleccionado:", method);
});
