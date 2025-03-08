import axios from "axios";
import { createEffect } from "effector";
import { PAYMENT_STATUS, EMBBEDED_CHECKOUT } from "../../../config";

interface EmbeddedCheckoutReq {
  coinsPackId: number;
}

interface PaymentStatusReq {
  orderId: number;
  token: string;
}

// EMBEDDED CHECKOUT
export const embeddedCheckoutFx = createEffect<
  EmbeddedCheckoutReq,
  string,
  string
>(async ({ coinsPackId }) => {
  try {
    const response = await axios.post<{ clientSecret: string }>(
      EMBBEDED_CHECKOUT,
      { coinsPackId },
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    return response.data.clientSecret;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Error al generar la sesión de pago.";
    throw errorMessage;
  }
});

// PAYMENT STATUS
export const getPaymentStatusFx = createEffect<PaymentStatusReq, any, string>(
  async ({ orderId, token }) => {
    try {
      const response = await axios.get(`${PAYMENT_STATUS}/${orderId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Error al obtener el estado del pago.";
      throw errorMessage;
    }
  }
);
