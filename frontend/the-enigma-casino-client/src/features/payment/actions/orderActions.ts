import { createEffect } from "effector";
import { LAST_ORDER, LAST_ORDER_ID } from "../../../config";
import { getAuthHeaders } from "../../auth/utils/autHeaders";

export const fetchLastOrderFx = createEffect(async () => {
  const response = await fetch(LAST_ORDER, {
    method: "GET",
    credentials: "include",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Error al obtener la última orden");
  }

  return response.json();
});

export const fetchLastOrderIdFx = createEffect(async () => {
  const response = await fetch(LAST_ORDER_ID, {
    method: "GET",
    credentials: "include",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Error al obtener el ID de la última orden");
  }

  return response.json();
});
