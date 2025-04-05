import axios from "axios";
import { createEffect } from "effector";
import { ETHEREUM_WITHDRAWAL, ETHEREUM_CONVERTION_WITHDRAWAL } from '../../../config';
export const fetchWithrawalFx = createEffect(async ({ token, to, coinsWithdrawal }: { token: string, to: string, coinsWithdrawal: number }) => {
  try {
    console.log("Enviando solicitud de retiro", { token, to, coinsWithdrawal });
    const response = await axios.post(
      ETHEREUM_WITHDRAWAL,
      { to, coinsWithdrawal },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    )
    console.log(response.data)
    return response.data
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.message || "Error inesperado en la transacción de retiro";
      throw new Error(errorMessage);
    } else {
      throw new Error("Error inesperado en la transacción de retiro");
    }
  }
});

export const fetchConvertWithdrawalFx = createEffect(async ({ token, Withdrawalcoins }: { token: string, Withdrawalcoins: number }) => {
  try {
    const response = await axios.post(
      ETHEREUM_CONVERTION_WITHDRAWAL,
      { Withdrawalcoins },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      console.error("Error en la transacción de retiro:", {
        status: error.response?.status,
        data: error.response?.data,
      });
      throw new Error(error.response?.data?.message || "Error en la transacción de retiro");
    } else {
      throw new Error("Error inesperado en la transacción de retiro");
    }
  }
});

