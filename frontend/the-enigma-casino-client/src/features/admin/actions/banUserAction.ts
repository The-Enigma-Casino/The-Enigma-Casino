import { createEffect } from "effector";
import axios from "axios";
import { getAuthHeaders } from "../../auth/utils/authHeaders";
import { BAN_USER_ADMIN } from "../../../config";

export const banUserFx = createEffect(async (userId: number) => {
  const response = await axios.put(`${BAN_USER_ADMIN}/${userId}`, null, {
    headers: getAuthHeaders(),
    withCredentials: true,
  });

  return response.data;
});
