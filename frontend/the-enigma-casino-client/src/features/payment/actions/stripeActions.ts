import { createEffect } from "effector";
import { PAYMENT_STATUS, EMBBEDED_CHECKOUT } from "../../../config";
import { getAuthHeaders } from "../../auth/utils/autHeaders";

export const stripeEmbeddedCheckoutFx = createEffect(async (coinsPackId: number) => {
  const response = await fetch(EMBBEDED_CHECKOUT, {
    method: "POST",
    credentials: "include",
    headers: getAuthHeaders(),
    body: JSON.stringify({ coinsPackId }),
  });

  if (!response.ok) {
    throw new Error("Error al iniciar el proceso de pago");
  }

  return response.json();
});

export const fetchStripePaymentStatusFx = createEffect(async (orderId: number) => {
  const response = await fetch(`${PAYMENT_STATUS}/${orderId}`, {
    method: "GET",
    credentials: "include",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Error al obtener el estado del pago");
  }

  return response.json();
});
