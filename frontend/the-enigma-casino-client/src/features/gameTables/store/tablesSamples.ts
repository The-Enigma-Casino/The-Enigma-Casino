import { sample } from "effector";
import {
  clearJoinProtection,
  clearPendingJoinTableId,
  clearWaitingOpponent,
  countdownCleared,
  forceLeaveTable,
  gameStarted,
  joinTableClicked,
  markLeftTable,
  requestAllPlayers,
  resetTableId,
  sendLeaveTableMessage,
  tableCleanupCompleted,
  tableUpdated,
  tableWaitingOpponent,
  tryJoinTable,
} from "./tablesEvents";
import { messageSent } from "../../../websocket/store/wsIndex";
import { $userId } from "../../auth/store/authStore";
import { navigateTo } from "../../games/shared/router/navigateFx";
import { $coins } from "../../coins/stores/coinsStore";
import toast from "react-hot-toast";
import {
  $currentTableId,
  $pendingJoinTableId,
  unmarkUserAsJoined,
} from "./tablesStores";

const getGamePathByTableId = (tableId: number): string => {
  if (tableId >= 1 && tableId <= 6) return "blackjack";
  if (tableId >= 7 && tableId <= 12) return "poker";
  if (tableId >= 13 && tableId <= 18) return "roulette";
  return "unknown";
};

sample({
  source: $userId,
  clock: joinTableClicked,
  filter: (userId) => !!userId,
  fn: (_userId, tableId) => {
    return JSON.stringify({
      type: "game_table",
      action: "join_table",
      tableId: String(tableId),
    });
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
    return path;
  },
  target: navigateTo,
});

sample({
  source: $coins,
  clock: tryJoinTable,
  filter: (coins) => coins > 0,
  fn: (_, tableId) => {
    return tableId;
  },
  target: joinTableClicked,
});

sample({
  source: $coins,
  clock: tryJoinTable,
  filter: (coins) => coins <= 0,
  fn: () => {
    toast.error("No tienes suficientes fichas para unirte a una mesa.", {
      id: "insufficient_coins_join",
    });
  },
});

sample({
  source: $pendingJoinTableId,
  filter: (tableId) =>
    tableId !== null && window.location.pathname.startsWith("/tables"),
  fn: (tableId) => {
    return tableId!;
  },
});
sample({
  clock: tryJoinTable,
  target: clearPendingJoinTableId,
});

sample({
  clock: tableUpdated,
  filter: (update) => {
    const isPoker = update.tableId >= 7 && update.tableId <= 12;
    const activePlayers = update.players.filter((p) => p !== null).length;
    return isPoker && (activePlayers === 1 || activePlayers >= 2);
  },
  fn: (update) => {
    const playerCount = update.players.filter((p) => p !== null).length;
    return {
      tableId: update.tableId,
      show: playerCount === 1,
    };
  },
}).watch(({ tableId, show }) => {
  if (show) {
    tableWaitingOpponent(tableId);
  } else {
    clearWaitingOpponent();
  }
});

sample({
  clock: sendLeaveTableMessage,
  source: $userId,
  filter: (userId) => !!userId,
  fn: (userId) => {
    unmarkUserAsJoined(Number(userId));
    return userId;
  },
});

sample({
  clock: forceLeaveTable,
  target: [
    resetTableId,
    markLeftTable,
    tableCleanupCompleted,
    clearJoinProtection,
  ],
});

sample({
  clock: requestAllPlayers,
  fn: () =>
    JSON.stringify({
      type: "game_table",
      action: "get_all_players",
    }),
  target: messageSent,
});