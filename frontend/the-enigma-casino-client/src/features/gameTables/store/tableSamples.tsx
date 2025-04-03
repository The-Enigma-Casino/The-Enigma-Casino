import { sample } from "effector";
import { $currentTableId, countdownCleared, joinTableClicked, sendLeaveTableMessage } from "./tablesIndex";
import { messageSent } from "../../../websocket/store/wsIndex";
import { $userId } from "../../auth/store/authStore";

sample({
  clock: joinTableClicked,
  fn: (tableId) =>
    JSON.stringify({
      type: "join_table",
      tableId: String(tableId),
    }),
  target: messageSent,
});

sample({
  clock: sendLeaveTableMessage,
  source: { tableId: $currentTableId, userId: $userId },
  filter: ({ tableId, userId }) => tableId !== null && userId !== "",
  fn: ({ tableId, userId }) =>
    JSON.stringify({
      type: "leave_table",
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
