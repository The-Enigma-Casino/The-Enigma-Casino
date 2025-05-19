import { socketMessageReceived } from "../../../websocket/store/wsEvents";
import { loadCoins } from "../../coins/store/coinsStore";
import { matchStarted } from "../../gameTables/store/tablesIndex";
import { matchPlayersInitialized } from "../pocker/stores/pokerIndex";
import { eliminatedNoCoinsReceived } from "./matchRemoval";
import { returnToTableReceived } from "./returnToTable";

socketMessageReceived.watch((data) => {
  if (data.type !== "game_match") return;

  switch (data.action) {
    case "match_started":
      matchStarted(data.tableId);
      matchPlayersInitialized(data.players);
      break;

    case "match_ended":
      break;

    case "eliminated_no_coins":
      eliminatedNoCoinsReceived();
      break;

    case "return_to_table":
      returnToTableReceived(data.message ?? "Has sido devuelto al lobby.");
      loadCoins();
      break;

    default:
      console.warn("[🧩 GameMatch] Acción desconocida:", data.action);
  }
});
