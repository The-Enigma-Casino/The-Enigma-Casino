import { createEffect } from "effector";
import { USER_COINS } from "../../../config";
import axios from "axios";
import { getAuthHeaders } from "../../auth/utils/autHeaders";

// GET COINS
export const getCoinsByUserFx = createEffect(async () => {
  try {
    const response = await axios.get<number>(USER_COINS, {
      withCredentials: true,
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      "Ocurrió un error inesperado al obtener los paquetes de monedas.";
    console.error("Error en la petición:", errorMessage);
    throw errorMessage;
  }
});
