import { createStore } from "effector";
import { connectWebSocketFx, disconnectSocket } from "./wsIndex";


export const $wsConnection = createStore<WebSocket | null>(null)
  .on(connectWebSocketFx.doneData, (_, ws) => ws)
  .reset(disconnectSocket);
