import axios from "axios";
import { createEffect } from "effector";
import { getAuthHeaders } from "../../../auth/utils/authHeaders";
import type { HistoryResponse } from "./types";
import { USER_HISTORY } from "../../../../config";
import { loadHistory } from "./historyEvents";

export const getUserHistoryFx = createEffect(async (page: number): Promise<HistoryResponse> => {
  const res = await axios.get(`${USER_HISTORY}?page=${page}`, {
    headers: getAuthHeaders(),
  });
  return res.data;
});


loadHistory.watch((page) => {
  getUserHistoryFx(page);
});
