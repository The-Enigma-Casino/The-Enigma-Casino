import toast from "react-hot-toast";
import { socketMessageReceived } from "../../../websocket/store/wsEvents";
import { Player } from "../models/GameTable.interface";
import { countdownStarted, countdownStopped, gameStarted, setPendingJoinTableId, tableUpdated } from "./tablesEvents"; // errorReceived añadir para toast
import { navigateTo } from "../../games/shared/router/navigateFx";
import { stopGameLoading } from "../../friends/stores/friends.events";


// Mensajes de error traducidos
const errorMessageMap: Record<string, string> = {
  already_left: "Has abandonado recientemente esta mesa. Espera a que termine la partida en curso o únete a otra mesa.",
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
      stopGameLoading(); // Cierra modal
      break;

    case "join_table": {
      const tableId = Number(data.tableId);

      const gameViewPath = (() => {
        if (tableId >= 1 && tableId <= 6) return "/tables/0";
        if (tableId >= 7 && tableId <= 12) return "/tables/1";
        if (tableId >= 13 && tableId <= 18) return "/tables/2";
        return "/tables";
      })();

      setPendingJoinTableId(tableId);
      navigateTo(gameViewPath);
      break;
    }

    case "error": {
      const rawMessage = data.message;
      const userMessage =
        errorMessageMap[rawMessage] || "No se pudo procesar tu solicitud.";

      if (typeof rawMessage === "string") {
        toast.error(userMessage);
        // errorReceived(rawMessage);  Controlar el error que siempre llega
      }
      break;
    }
  }
});

