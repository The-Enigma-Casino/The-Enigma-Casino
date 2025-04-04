import axios from "axios";
import { createEffect } from "effector";
import { ETHEREUM_WITHDRAWAL } from '../../../config';
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
  } catch (error) {
    console.error("Error en la transacción de retiro:", error);
    throw new Error("Error en la transacción de retiro");
  }
});
