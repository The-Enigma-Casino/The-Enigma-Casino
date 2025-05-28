import toast from "react-hot-toast";
import { socketMessageReceived } from "../../../websocket/store/wsEvents";
import { Player } from "../models/GameTable.interface";
import {
  countdownStarted,
  countdownStopped,
  gameStarted,
  markLeftTable,
  resetTableId,
  tableUpdated,
  tableWaitingOpponent,
} from "./tablesEvents";
import { stopGameLoading } from "../../friends/stores/friends.events";

const errorMessageMap: Record<string, string> = {
  already_left:
    "Has abandonado recientemente esta mesa. Espera a que termine la partida en curso o únete a otra mesa.",
  not_enough_coins: "No tienes suficientes fichas para unirte.",
  table_full: "La mesa está llena.",
  maintenance: "Esta mesa está en mantenimiento.",
};

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
      stopGameLoading();
      break;

    case "waiting_opponent": {
      const tableId = Number(data.tableId);
      toast(
        data.message ?? "Esperando más jugadores para comenzar la partida..."
      );
      tableWaitingOpponent(tableId);
      break;
    }
    case "error": {
      const errorKey = data.reason || data.message;
      const userMessage =
        errorMessageMap[errorKey] ||
        data.message ||
        "No se pudo procesar tu solicitud.";

      toast.error(userMessage);
      break;
    }
    case "join_denied":
      toast.error(data.reason);
      resetTableId();
      markLeftTable();
      break;

    case "table_closed": {
      break;
    }
    case "leave_success": {
      resetTableId();
      markLeftTable();
      break;
    }
    default:
      break;
  }
});
