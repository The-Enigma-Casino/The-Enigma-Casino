import { sample } from "effector";
import { clearPendingJoinTableId, countdownCleared, gameStarted, joinTableClicked, sendLeaveTableMessage, tryJoinTable } from "./tablesEvents";
import { messageSent } from "../../../websocket/store/wsIndex";
import { $userId } from "../../auth/store/authStore";
import { navigateTo } from "../../games/shared/router/navigateFx";
import { $coins } from "../../coins/store/coinsStore";
import toast from "react-hot-toast";
import { $currentTableId, $pendingJoinTableId } from "./tablesStores";


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
    console.log("🔁 Redirigiendo a:", path);
    return path;
  },
  target: navigateTo,
});

sample({
  source: $coins,
  clock: tryJoinTable,
  filter: (coins) => coins > 0,
  fn: (_, tableId) => tableId,
  target: joinTableClicked,
});

sample({
  source: $coins,
  clock: tryJoinTable,
  filter: (coins) => coins <= 0,
  fn: () => {
    toast.error("No tienes suficientes fichas para unirte a una mesa.");
  },
});


sample({
  source: $pendingJoinTableId,
  filter: (tableId) =>
    tableId !== null && window.location.pathname.startsWith("/tables"),
  fn: (tableId) => tableId!,
  target: tryJoinTable,
});
sample({
  clock: tryJoinTable,
  target: clearPendingJoinTableId,
});
