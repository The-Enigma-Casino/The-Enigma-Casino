import { sample } from "effector";
import { $currentTableId, countdownCleared, joinTableClicked, sendLeaveTableMessage } from "./tablesIndex";
import { messageSent } from "../../../websocket/store/wsIndex";
import { $userId } from "../../auth/store/authStore";
import { gameStarted } from "../models/GameTable.handlers";
import { navigateTo } from "../../games/shared/router/navigateFx";


const getGamePathByTableId = (tableId: number): string => {
  if (tableId >= 1 && tableId <= 6) return "blackjack";
  if (tableId >= 7 && tableId <= 12) return "poker";
  if (tableId >= 13 && tableId <= 18) return "roulette";
  return "unknown";
};


sample({
  clock: joinTableClicked,
  fn: (tableId) => {
    const msg = JSON.stringify({
      type: "game_table",
      action: "join_table",
      tableId: String(tableId),
    });
    console.log("⚡ SAMPLE ejecutado para join_table con:", tableId);
    console.log("🧾 Enviando mensaje WS:", msg);
    return msg;
  },
  target: messageSent,
});


sample({
  clock: sendLeaveTableMessage,
  source: { tableId: $currentTableId, userId: $userId },
  filter: ({ tableId, userId }) => tableId !== null && userId !== "",
  fn: ({ tableId, userId }) =>
    JSON.stringify({
      type: "game_table",
      action: "leave_table",
      tableId: String(tableId),
      userId,
    }),
  target: messageSent,
});

sample({
  clock: sendLeaveTableMessage,
  source: $currentTableId,
  filter: (tableId): tableId is number => tableId !== null,
  target: countdownCleared,
});

sample({
  clock: gameStarted,
  fn: ({ tableId }) => {
    const path = `/game/${getGamePathByTableId(tableId)}/${tableId}`;
    console.log("🔁 Redirigiendo a:", path); // <-- esto lo deberías ver ya
    return path;
  },
  target: navigateTo,
});

