import toast from "react-hot-toast";
import { socketMessageReceived } from "../../../websocket/store/wsEvents";
import { Player } from "../models/GameTable.interface";
import { countdownStarted, countdownStopped, errorReceived, gameStarted, joinTableClicked, tableUpdated } from "./tablesEvents";

// Mensajes de error traducidos
const errorMessageMap: Record<string, string> = {
  already_left: "Has abandonado recientemente esta mesa. Espera a que termine la partida en curso o únete a otra mesa.",
  not_enough_coins: "No tienes suficientes fichas para unirte.",
  table_full: "La mesa está llena.",
  maintenance: "Esta mesa está en mantenimiento.",
};
let lastJoinedTableId: number | null = null;
socketMessageReceived.watch((data) => {
  if (data.type !== "game_table") return;

  console.log("🎯 [game_table] Acción recibida:", data.action, data);

  switch (data.action) {
    case "table_update":
      tableUpdated({
        tableId: Number(data.tableId),
        players: data.players as (Player | null)[],
        state: data.state,
      });
      break;

    case "countdown_started":
      countdownStarted({
        tableId: Number(data.tableId),
        countdown: Number(data.countdown),
      });
      break;

    case "countdown_stopped":
      countdownStopped({ tableId: Number(data.tableId) });
      break;

    case "game_start":
      gameStarted({ tableId: Number(data.tableId) });
      break;

    case "error": {
      const rawMessage = data.message;
      const userMessage =
        errorMessageMap[rawMessage] || "No se pudo procesar tu solicitud.";

      if (typeof rawMessage === "string") {
        toast.error(userMessage);
        errorReceived(rawMessage);
      }
      break;
    }

    case "join_table": { // Friends
      const tableId = Number(data.tableId);
      if (lastJoinedTableId === tableId) {
        console.log(`[WS][Table] Ignorado: ya estamos en la mesa ${tableId}`);
        return;
      }

      lastJoinedTableId = tableId;
      joinTableClicked(tableId);
      break;
    }
    default:
      console.warn("[WS] Acción desconocida en game_table:", data);
  }
});
