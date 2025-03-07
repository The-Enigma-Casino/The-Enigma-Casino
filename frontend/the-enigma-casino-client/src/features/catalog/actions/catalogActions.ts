import axios from "axios";
import { createEffect } from "effector";
import { CoinsPack } from "../models/CoinsPack.interface";
import { COINS_PACK } from "../../../config";

// GET COINS PACKS
export const getCoinsPacksFx = createEffect(async () => {
  try {
    const response = await axios.get<CoinsPack[]>(COINS_PACK);
    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      "Ocurrió un error inesperado al obtener los paquetes de monedas.";
    throw errorMessage;
  }
});
