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
    clock: $wsConnection,
    source: messageSent,
    filter: () => $wsConnection.getState() !== null,
    fn: (message) => ({
      socket: $wsConnection.getState()!,
      message,
    }),
    target: sendMessageFx,
  });
  

// Cierre manual con logout
sample({
  clock: clearToken,
  target: disconnectSocket,
});
