import { createEffect } from "effector";
import { UserAdmin } from "../interfaces/UserAdmin.interface";
import { search_USERS_ADMIN } from "../../../config";
import axios from "axios";
import { getAuthHeaders } from "../../auth/utils/authHeaders";


export const searchAdminUsersFx = createEffect(async (nickName: string): Promise<UserAdmin[]> => {
  const response = await axios.get<UserAdmin[]>(`${search_USERS_ADMIN}?nickName=${encodeURIComponent(nickName)}`, {
    headers: getAuthHeaders(),
    withCredentials: true,
  });

  return response.data;
});
