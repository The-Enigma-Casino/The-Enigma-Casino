import axios from "axios";
import { TransactionData } from "../models/EthereumTransaction.interface";
import { createEffect } from "effector";
import { ETHEREUM_PAYMENT_CHECK, ETHEREUM_CHECK_TRANSACTION } from "../../../config";

export const fetchTransactionEthereumFx = createEffect(async ({ packId, token }: { packId: number; token: string }) => {
  try {
    const response = await axios.post(
      ETHEREUM_CHECK_TRANSACTION,
      { coinsPackId: packId },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    const unknownError = "Error en la API";
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.message || error.message;
      console.error("Error de Axios:", errorMessage);
      throw new Error(unknownError);
    } else {
      console.error("Error desconocido:", error);
      throw new Error(unknownError);
    }
  }
});



export const verifyTransactionEthereumFx = createEffect(
  async ({
    txHash,
    wallet,
    transactionData,
    packId,
    token,
  }: {
    txHash: string;
    wallet: string;
    transactionData: TransactionData;
    packId: number;
    token: string;
  }) => {
    try {
      const response = await axios.post(ETHEREUM_PAYMENT_CHECK, {
        hash: txHash,
        from: wallet,
        to: transactionData.to,
        value: transactionData.value,
        coinsPackId: packId,
      }, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error de Axios:", error.response?.data || error.message);
        throw new Error(error.response?.data?.message || "Error en la solicitud a la API");
      } else {
        console.error("Error desconocido:", error);
        throw error;
      }
    }
  }
);


