import { createStore, createEvent, createEffect, sample } from "effector";
import { jwtDecode } from "jwt-decode";
import { $token, clearToken } from "../features/auth/store/authStore";

// Eventos
export const connectSocket = createEvent();
const disconnectSocket = createEvent();
const messageSent = createEvent<string>();
const rawMessageReceived = createEvent<string>();
const socketError = createEvent<Error>();

// Usuarios en linea
export const updateOnlineUsers = createEvent<number>();
export const $onlineUsers = createStore<number>(0).on(updateOnlineUsers, (_, count) => count);

// Estado para controlar reconexiones
const reconnectDelay = 5000; // 5 segundos
let reconnectTimeout: NodeJS.Timeout | null = null;

// Efecto para conectar WebSocket
const connectWebSocketFx = createEffect(async (token: string) => {
  if (!token) throw new Error("No token disponible");

  let decoded;
  try {
    decoded = jwtDecode<{ id: string }>(token);
  } catch (error) {
    throw new Error("Token inválido");
  }

  const userId = decoded?.id;
  console.log(userId)
  if (!userId) throw new Error("El token no tiene userId");

  console.log(`Intetando conectar WebSocket con userId=${userId}`);

  const ws = new WebSocket(`wss://localhost:7186/socket?userId=${userId}`);

  return new Promise<WebSocket>((resolve, reject) => {
    ws.onopen = () => {
      console.log("WebSocket conectado");
      resolve(ws);
    };

    ws.onmessage = (event) => {
      console.log("mensaje recibido:", event.data);
      try {
        const data = JSON.parse(event.data);
        if (data.type === "onlineUsers") {
          updateOnlineUsers(data.count);
        }
      } catch (error) {
        console.error("Error al procesar el mensaje:", error);
      }
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
      socketError(new Error("Error en WebSocket"));
      reject(err);
    };

    ws.onclose = () => {
      console.warn("WebSocket cerrado, intentando reconectar...");
      disconnectSocket();

      // Intentar reconectar después de un tiempo
      if (reconnectTimeout === null) {
        reconnectTimeout = setTimeout(() => {
          reconnectTimeout = null;
          connectSocket();
        }, reconnectDelay);
      }
    };
  });
});

// Estado de la conexión WebSocket
const $connection = createStore<WebSocket | null>(null)
  .on(connectWebSocketFx.doneData, (_, ws) => ws)
  .reset(disconnectSocket);

// Efecto para enviar mensajes
const sendMessageFx = createEffect((params: { socket: WebSocket; message: string }) => {
  if (params.socket.readyState === WebSocket.OPEN) {
    console.log("Enviando mensaje:", params.message);
    params.socket.send(params.message);
  } else {
    console.error("No se pudo enviar el mensaje, WebSocket no está abierto");
  }
});

// Vincular eventos con estados
sample({
  clock: connectSocket,
  source: $token,
  filter: (token) => Boolean(token),
  target: connectWebSocketFx,
});

sample({
  clock: messageSent,
  source: $connection,
  filter: (socket) => socket !== null,
  fn: (socket, message) => ({ socket, message }),
  target: sendMessageFx,
});

// Cerrar conexión al cerrar sesión
sample({
  clock: clearToken,
  target: disconnectSocket,
});


if ($token.getState()) {
  connectSocket();
}
