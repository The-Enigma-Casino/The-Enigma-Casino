import { createStore, createEvent, createEffect, sample } from "effector";
import { jwtDecode } from "jwt-decode";
import { $token, clearToken } from "../features/auth/store/authStore";

// Eventos
export const connectSocket = createEvent();
const disconnectSocket = createEvent();
const messageSent = createEvent<string>();
const rawMessageReceived = createEvent<string>();
const socketError = createEvent<Error>();

// Usuarios en línea
export const updateOnlineUsers = createEvent<number>();
export const $onlineUsers = createStore<number>(0).on(updateOnlineUsers, (_, count) => count);

// Estado para controlar reconexiones
const reconnectDelay = 5000;
let reconnectTimeout: NodeJS.Timeout | null = null;

// Efecto para conectar WebSocket (debe ir arriba antes de usarse)
const connectWebSocketFx = createEffect(async (token: string) => {
  if (!token) throw new Error("No token disponible");

  let decoded;
  try {
    decoded = jwtDecode<{ id: string }>(token);
  } catch {
    throw new Error("Token inválido");
  }

  const userId = decoded?.id;
  if (!userId) throw new Error("El token no tiene userId");

  // Cerrar conexión previa si existe
  const existingSocket = $connection.getState();
  if (existingSocket && (existingSocket.readyState === WebSocket.OPEN || existingSocket.readyState === WebSocket.CONNECTING)) {
    console.warn("Cerrando conexión previa antes de reconectar");
    existingSocket.close();
  }

  console.log(`Conectando WebSocket con userId=${userId}`);

  const ws = new WebSocket(`wss://localhost:7186/socket?token=${token}&userId=${userId}`);

  return new Promise<WebSocket>((resolve, reject) => {
    ws.onopen = () => {
      console.log("✅ WebSocket conectado");
      resolve(ws);
    };

    ws.onmessage = (event) => {
      console.log("📨 Mensaje recibido:", event.data);
      try {
        const data = JSON.parse(event.data);
        if (data.type === "onlineUsers") {
          updateOnlineUsers(data.count);
        }
      } catch (err) {
        console.error("Error al procesar mensaje:", err);
      }
    };

    ws.onerror = (err) => {
      console.error("❌ WebSocket error:", err);
      socketError(new Error("Error en WebSocket"));
      reject(err);
    };

    ws.onclose = () => {
      console.warn("⚠️ WebSocket cerrado, intentando reconectar...");
      disconnectSocket();

      // Reintentar conexión si no hay otra activa
      if (reconnectTimeout === null && $connection.getState() === null) {
        reconnectTimeout = setTimeout(() => {
          reconnectTimeout = null;
          connectSocket();
        }, reconnectDelay);
      }
    };
  });
});

// Store de conexión WebSocket
const $connection = createStore<WebSocket | null>(null)
  .on(connectWebSocketFx.doneData, (_, ws) => ws)
  .reset(disconnectSocket);

// Cierre manual al hacer logout o reconexión
disconnectSocket.watch(() => {
  const socket = $connection.getState();
  if (socket && socket.readyState === WebSocket.OPEN) {
    console.log("Cerrando WebSocket manualmente");
    socket.close();
  }
});

// Enviar mensaje por WebSocket
const sendMessageFx = createEffect((params: { socket: WebSocket; message: string }) => {
  if (params.socket.readyState === WebSocket.OPEN) {
    console.log("📤 Enviando mensaje:", params.message);
    params.socket.send(params.message);
  } else {
    console.error("❌ WebSocket no está abierto");
  }
});

// Vincular efectos con eventos
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

sample({
  clock: clearToken,
  target: disconnectSocket,
});

// Conectar automáticamente si ya hay un token
if ($token.getState()) {
  connectSocket();
}