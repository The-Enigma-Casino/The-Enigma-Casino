import { socketMessageReceived } from "../../../websocket/store/wsEvents";
import { eliminatedNoCoinsReceived } from "./matchRemoval";

socketMessageReceived.watch((data) => {
  if (data.type !== "game_match") return;

  switch (data.action) {
    case "eliminated_no_coins":
      eliminatedNoCoinsReceived();
      break;

    default:
      console.warn("[🧩 GameMatch] Acción desconocida:", data.action);
  }
});
