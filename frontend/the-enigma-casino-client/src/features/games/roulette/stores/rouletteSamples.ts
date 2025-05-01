import { sample } from "effector";
import { $currentTableId } from "../../../gameTables/store/tablesStores";
import { messageSent } from "../../../../websocket/store/wsIndex";
import { gameStateReceived, matchReadyReceived, playerPlaceBet, requestGameState, setRoulettePlayers } from "./rouletteEvents";
import { navigateTo } from "../../shared/router/navigateFx";
import { RoulettePlayer } from "../types/roulettePlayer.type";
import { $name } from "../../../auth/store/authStore";
import { getPlayerAvatarsFx } from "../../actions/playerAvatarsAction";

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

