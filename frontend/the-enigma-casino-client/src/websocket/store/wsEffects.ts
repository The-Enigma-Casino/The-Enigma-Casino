import { createEffect } from "effector";
import { jwtDecode } from "jwt-decode";
import {
  $wsConnection,
  disconnectSocket,
  socketError,
  socketMessageReceived,
  updateOnlineUsers,
} from "./wsIndex";
import { ONLINE_USERS, WS_BASE_URL } from "../../config";

export const connectWebSocketFx = createEffect(async (token: string) => {
  const decoded = jwtDecode<{ id: string }>(token);
  const userId = decoded?.id;
  if (!userId) throw new Error("Token inválido");

  const existing = $wsConnection.getState();
  if (
    existing &&
    (existing.readyState === WebSocket.OPEN ||
      existing.readyState === WebSocket.CONNECTING)
  ) {
    existing.close();
  }

  const ws = new WebSocket(
    `${WS_BASE_URL}socket?token=${token}&userId=${userId}`
  );

  return new Promise<WebSocket>((resolve, reject) => {
    ws.onopen = () => resolve(ws);

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      socketMessageReceived(data);
      if (data.type === "onlineUsers") updateOnlineUsers(data.count);
    };

    ws.onerror = () => {
      socketError(new Error("WebSocket error"));
      reject();
    };

    ws.onclose = () => {
      disconnectSocket();

      console.warn("🔌 WebSocket cerrado. Reintentando en 2s...");

      setTimeout(() => {
        connectWebSocketFx(token);
      }, 2000);
    };
  });
});

export const sendMessageFx = createEffect(
  (params: { socket: WebSocket; message: string }) => {
    if (params.socket.readyState === WebSocket.OPEN) {
      params.socket.send(params.message);
    } else {
      console.warn("❌ WebSocket cerrado. No se pudo enviar mensaje.");
    }
  }
);

socketMessageReceived.watch((data) => {
  if (data.type === "poker") {
    console.log("📩 [WS] Mensaje de poker:", data.action, data);
  }
});

// Obtener el numero de usuarios online en caso de que no haya WebSocket

export const fetchOnlineUsersFx = createEffect(async () => {
  const res = await fetch(ONLINE_USERS);
  if (!res.ok) throw new Error("No se pudo obtener el número de usuarios online");
  const data = await res.json();
  return data.onlineUsers;
});

fetchOnlineUsersFx.done.watch(({ result }) => {
  updateOnlineUsers(result);
});
