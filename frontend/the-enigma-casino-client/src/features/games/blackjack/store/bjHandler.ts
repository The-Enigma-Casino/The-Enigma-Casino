import { socketMessageReceived } from "../../../../websocket/store/wsIndex";
import { $currentTableId } from "../../../gameTables/store/tablesStores";
import { gameStateReceived, betConfirmed, roundResultReceived, errorReceived, betsOpened, matchCancelled, turnStarted, resetTurnCountdown, matchReadyReceived, playerKickedReceived } from "../store/bjEvents";

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
    case "bets_opened":
      betsOpened({
        tableId: data.tableId,
        bettingDuration: data.bettingDuration,
      });
      break;
    case "turn_started":
      turnStarted({
        userId: data.currentTurnUserId,
        duration: data.turnDuration,
      });
      break;
    case "forced_stand":
      resetTurnCountdown();
      break;
    case "match_cancelled":
      matchCancelled({
        tableId: data.tableId,
        reason: data.reason,
      });
      break;
    case "match_ready": {
      const tableId = $currentTableId.getState();

      console.log(tableId);

      if (tableId !== null) {
        matchReadyReceived(tableId);
      } else {
        console.warn("No se encontró una mesa activa en el store.");
      }
      break;
    }
    case "kick_notice":
      playerKickedReceived(data);
      break;
    case "error":
      errorReceived(data.message);
      break;
    default:
      console.warn("[WS] Acción desconocida en blackjack:", data);
  }
});
