import { socketMessageReceived } from "../../../../websocket/store/wsIndex";
import {
  gameStateReceived,
  spinResultReceived,
  betConfirmed,
  betsOpenedReceived,
  betsClosedReceived,
  roulettePausedReceived
} from "./rouletteEvents";

socketMessageReceived.watch((data) => {
  if (data.type !== "roulette") return;

  console.log("[🎰 Ruleta] Mensaje recibido:", data);

  switch (data.action) {
    case "game_state":
      gameStateReceived(data);
      break;
    case "spin_result":
      spinResultReceived(data);
      break;
    case "bet_confirmed":
      betConfirmed(data);
      break;
    case "bets_opened":
      betsOpenedReceived();
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
