import { sample } from "effector";
import { $wsConnection, connectSocket, connectWebSocketFx, disconnectSocket, messageSent, sendMessageFx } from "./wsIndex";
import { $token, clearToken } from "../../features/auth/store/authStore";


// Conexión automática
sample({
  clock: connectSocket,
  source: $token,
  filter: (token) => Boolean(token),
  target: connectWebSocketFx,
});

// Enviar mensaje cuando haya WebSocket válido
sample({
  clock: messageSent,
  source: $wsConnection,
  filter: (socket): socket is WebSocket => socket !== null,
  fn: (socket: WebSocket, message: string) => ({
    socket,
    message,
  }),
  target: sendMessageFx,
});

// Cierre manual con logout
sample({
  clock: clearToken,
  target: disconnectSocket,
});
