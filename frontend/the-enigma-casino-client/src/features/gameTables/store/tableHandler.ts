import toast from "react-hot-toast";
import { socketMessageReceived } from "../../../websocket/store/wsEvents";
import {
  countdownStarted,
  countdownStopped,
  gameStarted,
  markLeftTable,
  resetTableId,
  setPendingJoinTableId,
  tableCleanupCompleted,
  tableUpdated,
  tableWaitingOpponent,
} from "./tablesEvents";

import { stopGameLoading } from "../../friends/stores/friends.events";
import { getPlayerAvatarsFx } from "../../games/actions/playerAvatarsAction";
import { navigateTo } from "../../games/shared/router/navigateFx";
import { $currentTableId, clearJoinProtection } from "./tablesIndex";
import { $userId } from "../../auth/store/authStore";

const errorMessageMap: Record<string, string> = {
  already_left:
    "Has abandonado recientemente esta mesa. Espera a que termine la partida en curso o únete a otra mesa.",
  not_enough_coins: "No tienes suficientes fichas para unirte.",
  table_full: "La mesa está llena.",
  maintenance: "Esta mesa está en mantenimiento.",
};

socketMessageReceived.watch((data) => {
  if (data.type !== "game_table") return;

  switch (data.action) {
    case "table_update": {
      const tableId = Number(data.tableId);
      const nickNames = data.players as string[];

      if (nickNames.length > 0) {
        getPlayerAvatarsFx(nickNames).then((avatars) => {
          const enrichedPlayers = nickNames.map((nick) => {
            const avatarData = avatars.find((a) => a.nickName === nick);
            const player = {
              name: nick,
              avatar: avatarData?.image ?? "/img/user_default.webp",
            };
            return player;
          });

          tableUpdated({
            tableId,
            players: enrichedPlayers,
            state: data.state,
          });
        });
      } else {
        tableUpdated({
          tableId,
          players: [],
          state: data.state,
        });
      }

      break;
    }

    case "countdown_started":
      countdownStarted({
        tableId: Number(data.tableId),
        countdown: Number(data.countdown),
      });
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
        data.message ?? "Esperando más jugadores para comenzar la partida...",
        {
          id: `waiting_opponent_${tableId}`,
        }
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

      toast.error(userMessage, {
        id: `ws_error_${errorKey ?? "default"}`,
      });
      break;
    }

    case "join_denied": {
      const currentTableId = $currentTableId.getState();
      const deniedTableId = Number(data.tableId);
      const reason = data.reason ?? "unknown";
      const userMessage =
        errorMessageMap[reason] ?? data.message ?? "No se pudo unir a la mesa.";

      if (reason === "already_joined") {
        if (currentTableId === deniedTableId) {
          console.log(
            "⚠️ join_denied (already_joined), pero ya estás en la mesa. No se resetea ni se muestra toast."
          );
          return;
        }
      } else {
        toast.error(userMessage, {
          id: `join_denied_${reason}`,
        });
      }

      const unrecoverable = [
        "already_left",
        "table_full",
        "maintenance",
        "not_enough_coins",
      ];

      if (unrecoverable.includes(reason)) {
        resetTableId();
        markLeftTable();
      }

      break;
    }

    case "table_closed": {
      break;
    }

    case "leave_success": {
      if (Number(data.userId) === Number($userId.getState())) {
        resetTableId();
        markLeftTable();
      }

      tableCleanupCompleted();
      clearJoinProtection();
      break;
    }

    default:
      break;
  }
});
