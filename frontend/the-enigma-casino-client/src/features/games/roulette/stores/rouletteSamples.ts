import { sample } from "effector";
import { $currentTableId } from "../../../gameTables/store/tablesStores";
import { messageSent } from "../../../../websocket/store/wsIndex";
import { playerPlaceBet, requestGameState } from "./rouletteEvents";

sample({
  clock: playerPlaceBet,
  source: $currentTableId,
  fn: (tableId, bet) =>
    JSON.stringify({
      type: "roulette",
      action: "place_bet",
      tableId: String(tableId),
      ...bet
    }),
  target: messageSent,
});

sample({
  clock: requestGameState,
  fn: (tableId) =>
    JSON.stringify({
      type: "roulette",
      action: "request_game_state",
      tableId: String(tableId),
    }),
  target: messageSent,
});
