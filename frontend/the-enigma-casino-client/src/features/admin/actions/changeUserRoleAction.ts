import { createEffect } from "effector";
import axios from "axios";
import { getAuthHeaders } from "../../auth/utils/authHeaders";
import { UPDATE_ROLE_ADMIN } from "../../../config";


export const changeUserRoleFx = createEffect(async (userId: number) => {
  const response = await axios.put(`${UPDATE_ROLE_ADMIN}/${userId}`, null, {
    headers: getAuthHeaders(),
    withCredentials: true,
  });

  return response.data;
});
