import {
  socketMessageReceived,
  messageSent,
} from "../../../../websocket/store/wsIndex";
import { stopGameLoading } from "../../../friends/stores/friends.events";
import { $currentTableId } from "../../../gameTables/store/tablesIndex";
import {
  gameStateReceived,
  spinResultReceived,
  betConfirmed,
  betsOpenedReceived,
  betsClosedReceived,
  placeRouletteBet,
  countdownTick,
  rouletteStopedReceived,
  matchReadyReceived,
  playerKickedReceived,
} from "./rouletteEvents";

socketMessageReceived.watch((data) => {
  if (data.type !== "roulette") return;

  switch (data.action) {
    case "game_state":
      gameStateReceived(data);
      if (data.secondsRemaining != null) {
        countdownTick(data.secondsRemaining);
      }
      break;
    case "spin_result":
      spinResultReceived(data);
      break;
    case "bet_confirmed":
      betConfirmed(data);
      break;
    case "bets_opened":
      betsOpenedReceived();
      if (data.countdown != null) {
        countdownTick(data.countdown);
      }
      break;
    case "bets_closed":
      betsClosedReceived();
      break;
    case "roulette_paused":
      break;
    case "roulette_stoped":
      rouletteStopedReceived();
      break;
    case "match_ready": {
      const tableId = $currentTableId.getState();

      console.log(tableId);

      if (tableId !== null) {
        matchReadyReceived(tableId);
      }
      break;
    }
    case "round_cancelled":
    case "player_kicked":
      playerKickedReceived(data);
      break;

    case "wheel_state":
      gameStateReceived({
        tableId: data.tableId,
        canPlaceBets: false,
        wheelRotation: data.wheelRotation,
        players: [],
      });
      stopGameLoading(); // Cierra modal friends
      break;

    default:
  }
});

placeRouletteBet.watch((payload) => {
  const message = {
    type: "roulette",
    action: "place_bet",
    ...payload,
  };

  messageSent(JSON.stringify(message));
});
