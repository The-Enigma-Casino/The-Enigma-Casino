import { sample } from "effector";
import { playerPlaceBet, playerStand, doubleDown, playerHit } from "./bjEvents";
import { $currentTableId } from "../../../gameTables/store/tablesStores";
import { messageSent } from "../../../../websocket/store/wsIndex";
import { $localPlayerRoundResult, $roundResults } from "./bjStores";
import { $userId } from "../../../auth/store/authStore";

sample({
  clock: playerPlaceBet,
  source: $currentTableId,
  fn: (tableId, amount) => {
    const msg = JSON.stringify({
      type: "blackjack",
      action: "place_bet",
      tableId: String(tableId),
      amount,
    });
    return msg;
  },
  target: messageSent,
});

sample({
  clock: playerStand,
  source: $currentTableId,
  fn: (tableId) => JSON.stringify({
    type: "blackjack",
    action: "player_stand",
    tableId: String(tableId),
  }),
  target: messageSent,
});

sample({
  clock: playerHit,
  source: $currentTableId,
  fn: (tableId) =>
    JSON.stringify({
      type: "blackjack",
      action: "player_hit",
      tableId: String(tableId),
    }),
  target: messageSent,
});

sample({
  clock: doubleDown,
  source: $currentTableId,
  fn: (tableId) =>
    JSON.stringify({
      type: "blackjack",
      action: "double_down",
      tableId: String(tableId),
    }),
  target: messageSent,
});

messageSent.watch((msg) => {
  console.log("Mensaje enviado al WS:", msg);
});


sample({
  source: { results: $roundResults, uid: $userId },
  fn: ({ results, uid }) => {
    const r = results.find((res) => res.userId === Number(uid));
    return r
      ? {
          result: r.result,
          coinsChange: r.coinsChange,
          finalTotal: r.finalTotal,
        }
      : null;
  },
  target: $localPlayerRoundResult,
});
