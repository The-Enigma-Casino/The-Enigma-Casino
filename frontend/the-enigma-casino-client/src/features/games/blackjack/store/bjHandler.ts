import { socketMessageReceived } from "../../../../websocket/store/wsIndex";
import { gameStateReceived, betConfirmed, roundResultReceived, errorReceived } from "../store/bjEvents";

socketMessageReceived.watch((data) => {
  if (data.type !== "blackjack") return;

  console.log("[WS]", JSON.stringify(data, null, 2));

  switch (data.action) {
    case "game_state":
      gameStateReceived(data);
      break;
    case "bet_confirmed":
      betConfirmed(data);
      break;
    case "round_result":
      roundResultReceived(data);
      break;
    case "error":
      errorReceived(data.message);
      break;
    default:
      console.warn("[WS] Acción desconocida en blackjack:", data);
  }
});
