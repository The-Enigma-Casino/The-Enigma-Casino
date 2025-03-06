import { createEvent, createStore } from "effector";

// Evento para seleccionar una tarjeta
export const selectCard = createEvent<any>();

// Evento para seleccionar un método de pago
export const selectPaymentMethod = createEvent<string>();

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
