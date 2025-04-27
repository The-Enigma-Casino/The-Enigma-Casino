import { createEffect } from "effector";
import { UserAdmin } from "../interfaces/UserAdmin.interface";
import { USERS_ADMIN } from "../../../config";
import axios from "axios";
import { getAuthHeaders } from "../../auth/utils/authHeaders";

export const loadAdminUsersFx = createEffect(async (): Promise<UserAdmin[]> => {
  const response = await axios.get<UserAdmin[]>(USERS_ADMIN, {
    headers: getAuthHeaders(),
    withCredentials: true,
  });

  return response.data;
});
