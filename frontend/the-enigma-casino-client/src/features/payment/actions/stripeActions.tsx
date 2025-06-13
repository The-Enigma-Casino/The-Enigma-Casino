import axios from "axios";

import { createEffect } from "effector";
import { PAYMENT_STATUS, EMBBEDED_CHECKOUT } from "../../../config";
import { getAuthHeaders } from "../../auth/utils/authHeaders";

export const fetchClientSecretFx = createEffect(async (coinsPackId: number) => {

  try {
    const response = await axios.post(
      EMBBEDED_CHECKOUT,
      { coinsPackId },
      {
        withCredentials: true,
        headers: getAuthHeaders(),
      }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "❌ Error en la API:",
        error.response?.status,
        error.message
      );
      throw new Error(`Error ${error.response?.status}: ${error.message}`);
    } else {
      console.error("❌ Error inesperado en fetchClientSecretFx:", error);
      throw new Error("Error desconocido al iniciar el proceso de pago");
    }
  }
});

export const fetchPaymentStatusFx = createEffect(async (orderId: number) => {
  try {
    const response = await axios.get(`${PAYMENT_STATUS}/${orderId}`, {
      withCredentials: true,
      headers: getAuthHeaders(),
    });

    return response.data.paymentStatus;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "❌ Error al obtener el estado del pago:",
        error.response?.status
      );
      throw new Error(`Error ${error.response?.status}: ${error.message}`);
    } else {
      console.error("❌ Error inesperado:", error);
      throw new Error("Error desconocido al obtener el estado del pago");
    }
  }
});
