import { sample } from "effector";
import { $currentTableId, forceLeaveTable } from "../../../gameTables/store/tablesIndex";
import { messageSent } from "../../../../websocket/store/wsIndex";
import {
  matchReadyReceived,
  removedByInactivity,
  sendPokerAction,
} from "./pokerIndex";
import toast from "react-hot-toast";
import { navigateTo } from "../../shared/router/navigateFx";

sample({
  clock: sendPokerAction,
  source: $currentTableId,
  fn: (tableId, { move, amount }) => {
    const payload = {
      type: "poker",
      action: "player_action",
      tableId: String(tableId),
      move,
      ...(move === "raise" || move === "all-in" ? { amount } : {}),
    };

    const message = JSON.stringify(payload, [
      "type",
      "action",
      "tableId",
      "move",
      "amount",
    ]);

    return message;
  },
  target: messageSent,
});

sample({
  source: removedByInactivity,
  fn: () => {
    toast.error("Has sido expulsado de la mesa por inactividad.", {
      id: "kicked_for_inactivity",
    });
    return "/";
  },
  target: [navigateTo, forceLeaveTable],
});

sample({
  clock: matchReadyReceived,
  fn: (tableId) => `/game/poker/${tableId}`,
  target: navigateTo,
});
