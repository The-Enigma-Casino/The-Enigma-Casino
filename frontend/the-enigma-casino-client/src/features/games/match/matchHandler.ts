import toast from "react-hot-toast";
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

    case "player_left_match":
      console.log(data.action + "aaaaaaaaaaaaa");
      toast("👤 " + data.message);
      break;
    case "match_cancelled":
      toast.error(data.message);
      break;
    case "match_ready":
      toast.success(data.message);
      break;

    default:
      console.warn("[🧩 GameMatch] Acción desconocida:", data.action);
  }
});
