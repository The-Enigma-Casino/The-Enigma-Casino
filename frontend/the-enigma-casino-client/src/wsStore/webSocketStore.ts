import { createStore, createEvent, sample } from "effector";
import { $token } from "../features/auth/store/authStore";
import { jwtDecode } from "jwt-decode";

// Eventos
export const setOnlineUsers = createEvent<number>();
export const setWebSocket = createEvent<WebSocket | null>();
export const connectWebSocket = createEvent<string>();
export const disconnectWebSocket = createEvent();
export const setError = createEvent<string>();

// Stores
export const $socket = createStore<WebSocket | null>(null).on(setWebSocket, (_, socket) => socket);
export const $onlineUsers = createStore<number>(0).on(setOnlineUsers, (_, count) => count);
export const $error = createStore<string | null>(null).on(setError, (_, error) => error);

let reconnectTimeout: NodeJS.Timeout | null = null;

export const connect = (userId: string) => {
  const socketUrl = `ws://localhost:7186/socket?userId=${userId}`;
  console.log("Intentando conectar a:", socketUrl);

  let socket: WebSocket | null = new WebSocket(socketUrl);

  socket.onopen = () => {
    console.log("WebSocket conectado");
    setWebSocket(socket);
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout); // Cancela el intento de reconexión
      reconnectTimeout = null;
    }
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.type === "onlineUsers") {
        setOnlineUsers(data.count);
      }
      console.log("Mensaje recibido:", data);
    } catch (e) {
      console.error("Error al procesar el mensaje WebSocket", e);
      setError("Error al procesar el mensaje WebSocket");
    }
  };

  socket.onerror = (error) => {
    console.error("WebSocket Error:", error);
    setError("Error en WebSocket");
  };

  socket.onclose = () => {
    console.log("WebSocket cerrado.");
    setWebSocket(null);

  };

  return socket;
};

// Conectar el WebSocket cuando se emite el evento connectWebSocket
sample({
  clock: connectWebSocket,
  fn: (userId) => {
    const currentSocket = $socket.getState();
    if (currentSocket) {
      console.log("Cerrando conexión WebSocket anterior...");
      currentSocket.close();
    }
    return connect(userId);
  },
  target: setWebSocket,
});

// Desconectar el WebSocket cuando se emite el evento disconnectWebSocket
sample({
  clock: disconnectWebSocket,
  fn: () => {
    const socket = $socket.getState();
    if (socket) {
      console.log("Desconectando WebSocket...");
      socket.close();
    }
    return null;
  },
  target: setWebSocket,
});

$token.watch((token) => {
  if (token) {
    try {
      // Decodifica el token y extrae el userId
      const decodedToken = jwtDecode<any>(token);
      const userId = decodedToken?.id;
      console.log("UserID obtenido:", userId);

      if (userId) {
        connectWebSocket(userId.toString()); // Emitir el evento de conexión con el userId
      } else {
        console.error("UserId no encontrado en el token");
        setError("UserId no encontrado en el token");
      }
    } catch (error) {
      console.error("Error al decodificar el token:", error);
      setError("Error al decodificar el token");
    }
  }
});
