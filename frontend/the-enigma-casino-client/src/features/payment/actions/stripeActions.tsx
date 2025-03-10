import axios, { AxiosError } from "axios";

import { createEffect } from "effector";
import { PAYMENT_STATUS, EMBBEDED_CHECKOUT } from "../../../config";
import { getAuthHeaders } from "../../auth/utils/autHeaders";

export const fetchClientSecretFx = createEffect(async (coinsPackId: number) => {
  console.log("🔄 Llamando a la API con ID:", coinsPackId);

  try {
    const response = await axios.post(
      EMBBEDED_CHECKOUT,
      { coinsPackId },
      {
        withCredentials: true,
        headers: getAuthHeaders(),
      }
    );

    console.log("📡 Estado de la respuesta:", response.status);
    console.log("✅ Respuesta de la API:", response.data);

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
  console.log(`🔄 Solicitando estado del pago para orderId: ${orderId}`);

  try {
    const response = await axios.get(`${PAYMENT_STATUS}/${orderId}`, {
      withCredentials: true,
      headers: getAuthHeaders(),
    });

    console.log(
      "📡 Respuesta de la API:",
      response.status,
      response.statusText
    );
    console.log("✅ Estado del pago recibido:", response.data);

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
