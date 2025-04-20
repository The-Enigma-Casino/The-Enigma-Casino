import { socketMessageReceived, messageSent } from "../../../../websocket/store/wsIndex";
import {
  gameStateReceived,
  spinResultReceived,
  betConfirmed,
  betsOpenedReceived,
  betsClosedReceived,
  roulettePausedReceived,
  placeRouletteBet,
  resetSpinResult,
  countdownTick
} from "./rouletteEvents";

socketMessageReceived.watch((data) => {
  if (data.type !== "roulette") return;

  console.log("[🎰 Ruleta] Mensaje recibido:", data);

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
      resetSpinResult();
      break;
    case "bets_closed":
      betsClosedReceived();
      break;
    case "roulette_paused":
      roulettePausedReceived();
      break;
    default:
      console.warn("[Ruleta] Acción desconocida:", data.action);
  }
});

placeRouletteBet.watch((payload) => {
  const message = {
    type: "roulette",
    action: "place_bet",
    ...payload,
  };

  console.log("[🎰 Ruleta] Enviando apuesta:", message);
  messageSent(JSON.stringify(message));
});


