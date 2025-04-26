import { createStore } from "effector";
import type { ChatMessage } from "../interfaces/chatMessage";
import { createEvent } from "effector";
import { socketMessageReceived } from "../../../../websocket/store/wsIndex";
import { sample } from "effector";
import { $currentTableId } from "../../../gameTables/store/tablesStores";
import { messageSent as messageSentToWS } from "../../../../websocket/store/wsIndex";

export const messageReceived = createEvent<ChatMessage>();

export const messageSent = createEvent<{ tableId: number; text: string }>();

export const $chatMessages = createStore<ChatMessage[]>([])
.on(messageReceived, (state, msg) => [...state, msg].slice(-50));

socketMessageReceived.watch((data) => {
  if (data.type !== "chat") return;

  console.log("[📨 Chat recibido]", data);

  if (data.action === "new_message") {
    messageReceived({
      userId: data.userId,
      nickname: data.nickname,
      avatarUrl: data.avatarUrl,
      text: data.text,
      timestamp: data.timestamp,
      tableId: data.tableId,
    });
  }
});

sample({
  clock: messageSent,
  source: $currentTableId,
  fn: (tableId, { text }) =>
    JSON.stringify({
      type: "chat",
      action: "new_message",
      tableId: String(tableId),
      text,
    }),
  target: messageSentToWS,
});

messageSentToWS.watch((msg) => {
  console.log("📤 [Chat] Mensaje enviado al WS:", msg);
});
