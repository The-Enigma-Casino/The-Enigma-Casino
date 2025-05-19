import { createEffect } from "effector";
import axios from "axios";
import { AUTO_BAN } from "../../../config";
import { getAuthHeaders } from "../../auth/utils/authHeaders";

export const autoBanFx = createEffect(async () => {
  await axios.put(
    AUTO_BAN,
    {},
    {
      withCredentials: true,
      headers: getAuthHeaders(),
    }
  );
});
