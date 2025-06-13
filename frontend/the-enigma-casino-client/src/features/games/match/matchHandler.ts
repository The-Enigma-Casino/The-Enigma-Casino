import toast from "react-hot-toast";
import { socketMessageReceived } from "../../../websocket/store/wsEvents";
import { loadCoins } from "../../coins/stores/coinsStore";
import { eliminatedNoCoinsReceived } from "./matchRemoval";
import { returnToTableReceived } from "./returnToTable";

socketMessageReceived.watch((data) => {
  if (data.type !== "game_match") return;

  switch (data.action) {
    case "match_started":
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
      toast("👤 " + data.message, {
        id: "player_left_match",
      });
      break;

    case "match_cancelled":
      toast.error(data.message, {
        id: "match_cancelled",
      });
      break;

    case "match_ready":
      toast.success(data.message, {
        id: "match_ready",
      });
      break;

    default:
      console.warn("[🧩 GameMatch] Acción desconocida:", data.action);
  }
});
