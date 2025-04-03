import { createEffect } from "effector";
import { $token } from "../../auth/store/authStore";
import { GAMETABLES_ENDPOINT } from "../../../config";
import axios from "axios";

export const fetchTables = createEffect<number, any>(async (gameType) => {
  try {
    const token = $token.getState();

    const response = await axios.get<any>(`${GAMETABLES_ENDPOINT}`, {
      params: { gameType },
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error al obtener las mesas", error);
    throw new Error("No se pudieron cargar las mesas");
  }
});
