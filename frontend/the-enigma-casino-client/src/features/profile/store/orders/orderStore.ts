import { createStore } from "effector";
import { getUserOrdersFx } from "./orderEffects";
import type { OrderDto } from "./type";

export const $orders = createStore<OrderDto[]>([]).on(
  getUserOrdersFx.doneData,
  (_, payload) => payload.orders
);

export const $ordersPage = createStore(1).on(
  getUserOrdersFx.doneData,
  (_, payload) => payload.page
);

export const $ordersTotalPages = createStore(1).on(
  getUserOrdersFx.doneData,
  (_, payload) => payload.totalPages
);
