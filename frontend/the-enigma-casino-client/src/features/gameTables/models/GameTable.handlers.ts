import { createEvent } from "effector";
import { Player } from "./GameTable.interface";
import { socketMessageReceived } from "../../../websocket/store/wsIndex";

// Eventos específicos
export const tableUpdated = createEvent<{
  tableId: number;
  players:  (Player | null)[];
  state: string;
}>();

export const countdownStarted = createEvent<{
  tableId: number;
  countdown: number;
}>();

export const countdownStopped = createEvent<{ tableId: number }>();
export const gameStarted = createEvent<{ tableId: number }>();
export const errorReceived = createEvent<string>();

// Enrutamiento por tipo
socketMessageReceived.watch((data) => {
  switch (data.type) {
    case "table_update":
      tableUpdated(data);
      break;
    case "countdown_started":
      countdownStarted(data);
      break;
    case "countdown_stopped":
      countdownStopped(data);
      break;
    case "game_start":
      gameStarted(data);
      break;
    case "error":
      errorReceived(data.message);
      break;
    default:
      console.warn("[WS] Tipo de mensaje desconocido:", data);
  }
});
