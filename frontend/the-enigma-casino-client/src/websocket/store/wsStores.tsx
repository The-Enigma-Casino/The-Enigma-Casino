import { createStore } from "effector";
import { updateOnlineUsers } from "./wsEvents";

export const $onlineUsers = createStore(0).on(updateOnlineUsers, (_, count) => count);