import { createEffect } from "effector";
import axios from "axios";
import { getAuthHeaders } from "../../auth/utils/authHeaders";
import { PACKS_ADMIN } from "../../../config";

export const loadPacksFx = createEffect(async () => {
  const response = await axios.get(`${PACKS_ADMIN}`, {
    headers: getAuthHeaders(),
    withCredentials: true,
  });

  return response.data;
});
