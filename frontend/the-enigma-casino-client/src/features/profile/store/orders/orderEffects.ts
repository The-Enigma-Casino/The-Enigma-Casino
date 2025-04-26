import axios from "axios";
import { createEffect } from "effector";
import { getAuthHeaders } from "../../../auth/utils/authHeaders";
import { USER_HISTORY_ORDERS } from "../../../../config";
import type { OrderResponse } from "./type";
import { loadOrders } from "./orderEvents";

export const getUserOrdersFx = createEffect(async (page: number): Promise<OrderResponse> => {
  const res = await axios.get(`${USER_HISTORY_ORDERS}?page=${page}`, {
    headers: getAuthHeaders(),
  });
  return res.data;
});

loadOrders.watch((page) => {
  getUserOrdersFx(page);
});
