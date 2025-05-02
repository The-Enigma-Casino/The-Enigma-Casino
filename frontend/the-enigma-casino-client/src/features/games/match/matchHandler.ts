import { socketMessageReceived } from "../../../websocket/store/wsEvents";
import { matchStarted } from "../../gameTables/store/tablesIndex";
import { eliminatedNoCoinsReceived } from "./matchRemoval";

socketMessageReceived.watch((data) => {
  if (data.type !== "game_match") return;

  switch (data.action) {
    case "match_started":
      matchStarted(data.tableId);
      break;

    case "match_ended":
      break;

    case "eliminated_no_coins":
      eliminatedNoCoinsReceived();
      break;

    case "return_to_table":
      break;

    default:
      console.warn("[🧩 GameMatch] Acción desconocida:", data.action);
  }
});
