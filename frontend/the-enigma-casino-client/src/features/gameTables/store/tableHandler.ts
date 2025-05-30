import toast from "react-hot-toast";
import { socketMessageReceived } from "../../../websocket/store/wsEvents";
import {
  countdownStarted,
  countdownStopped,
  gameStarted,
  markLeftTable,
  resetTableId,
  setPendingJoinTableId,
  tableUpdated,
  tableWaitingOpponent,
} from "./tablesEvents";

import { stopGameLoading } from "../../friends/stores/friends.events";
import { getPlayerAvatarsFx } from "../../games/actions/playerAvatarsAction";
import { navigateTo } from "../../games/shared/router/navigateFx";

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
    case "table_update": {
      const tableId = Number(data.tableId);
      const nickNames = data.players as string[];

      console.log("🧩 [table_update] Mesa:", tableId);
      console.log("👥 Nicknames recibidos:", nickNames);

      if (nickNames.length > 0) {
        getPlayerAvatarsFx(nickNames).then((avatars) => {
          console.log("📦 Avatares recibidos del backend:", avatars);

          const enrichedPlayers = nickNames.map((nick) => {
            const avatarData = avatars.find((a) => a.nickName === nick);
            const player = {
              name: nick,
              avatar: avatarData?.image ?? "/img/user_default.webp",
            };
            console.log(`🎨 Avatar aplicado a ${nick}:`, player.avatar);
            return player;
          });

          tableUpdated({
            tableId,
            players: enrichedPlayers,
            state: data.state,
          });

          console.log(
            "✅ [tableUpdated] Jugadores enriquecidos enviados al store."
          );
        });
      } else {
        console.log("⚠️ No hay jugadores en la mesa.");
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
