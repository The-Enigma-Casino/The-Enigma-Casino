import { createEffect } from "effector";
import axios from "axios";
import { getAuthHeaders } from "../../auth/utils/authHeaders";
import { PACKS_ADMIN_ID } from "../../../config";

export const getPackByIdFx = createEffect(async (id: number) => {
  const response = await axios.get(`${PACKS_ADMIN_ID}/${id}`, {
    headers: getAuthHeaders(),
    withCredentials: true,
  });

  return response.data;
});
