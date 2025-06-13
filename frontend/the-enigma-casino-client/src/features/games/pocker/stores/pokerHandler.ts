import { socketMessageReceived } from "../../../../websocket/store/wsIndex";
import { $userId } from "../../../auth/store/authStore";
import { loadCoins } from "../../../coins/stores/coinsStore";
import { $currentTableId } from "../../../gameTables/store/tablesIndex";
import {
  pokerPhaseChanged,
  communityCardsUpdated,
  validMovesUpdated,
  myHandUpdated,
  callAmountUpdated,
  maxRaiseUpdated,
  myTurnEnded,
  myTurnStarted,
  blindsAssigned,
  betConfirmedReceived,
  matchPlayersInitialized,
  turnCountdownSet,
  turnCountdownTotalSet,
  resetPokerGame,
  roundResultReceived,
  removedByInactivity,
  opponentLeftReceived,
  matchReadyReceived,
  currentTurnChanged,
  playerActionReceived,
} from "../stores/pokerIndex";

let reentryAttempts = 0;

socketMessageReceived.watch((data) => {
  if (data.type !== "poker") return;

  switch (data.action) {
    case "match_ready": {
      const tableId = $currentTableId.getState();
      if (tableId !== null) {
        matchReadyReceived(tableId);
      } else {
        console.warn("⚠️ No se encontró una mesa activa en el store.");
      }
      break;
    }

    case "players_initialized": {
      const userId = $userId.getState();

      if (!userId && reentryAttempts < 5) {
        reentryAttempts++;
        setTimeout(() => socketMessageReceived(data), 50);
        return;
      }

      reentryAttempts = 0; // reset si fue exitoso
      resetPokerGame();
      const players = data.players.map((p: any) => ({
        id: p.id,
        nickname: p.nickname,
        coins: p.coins,
      }));

      matchPlayersInitialized(players);
      break;
    }

    case "initial_hand": {
      const cards = data.cards.map((c: any) => ({
        rank: c.rank,
        suit: c.suit,
        value: c.value,
        gameType: "Poker",
      }));
      myHandUpdated(cards);
      break;
    }

    case "blinds_assigned":
      blindsAssigned({
        dealer: data.dealer,
        smallBlind: data.smallBlind,
        bigBlind: data.bigBlind,
      });
      break;

    case "start_betting": {
      pokerPhaseChanged(data.phase);
      break;
    }

    case "your_turn": {
      myTurnStarted();
      validMovesUpdated(data.validMoves);
      callAmountUpdated(data.callAmount ?? 0);
      maxRaiseUpdated(data.maxRaise ?? 0);
      break;
    }

    case "turn_started": {
      currentTurnChanged(data.currentTurnUserId);
      break;
    }

    case "turn_timer": {
      turnCountdownSet(data.time);
      turnCountdownTotalSet(data.time);
      break;
    }

    case "bet_confirmed":
      betConfirmedReceived({
        userId: data.userId,
        bet: data.bet,
        totalBet: data.totalBet,
      });
      loadCoins();
      break;

    case "player_action":
      playerActionReceived({
        userId: data.userId,
        move: data.move,
        amount: data.amount,
        totalBet: data.totalBet,
      });
      myTurnEnded();
      break;

    case "round_result":
      pokerPhaseChanged("showdown");
      roundResultReceived({
        summary: data.summary,
        revealedHands: data.revealedHands,
      });
      loadCoins();
      myTurnEnded();
      break;

    case "flop_dealt": {
      const cards = data.cards.map((c: any) => ({
        suit: c.suit,
        rank: c.rank,
        value: 0,
        gameType: "Poker",
      }));
      pokerPhaseChanged("flop");
      myTurnEnded();
      communityCardsUpdated(cards);
      break;
    }

    case "turn_dealt": {
      const cards = data.cards.map((c: any) => ({
        suit: c.suit,
        rank: c.rank,
        value: 0,
        gameType: "Poker",
      }));
      pokerPhaseChanged("turn");
      myTurnEnded();
      communityCardsUpdated(cards);
      break;
    }

    case "river_dealt": {
      const cards = data.cards.map((c: any) => ({
        suit: c.suit,
        rank: c.rank,
        value: 0,
        gameType: "Poker",
      }));
      pokerPhaseChanged("river");
      myTurnEnded();
      communityCardsUpdated(cards);
      break;
    }

    case "removed_by_inactivity":
      removedByInactivity();
      break;

    case "opponent_left":
      opponentLeftReceived();
      break;

    default:
      console.warn("🤷‍♂️ Acción desconocida:", data.action);
      break;
  }
});
