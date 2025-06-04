import { socketMessageReceived } from "../../../../websocket/store/wsIndex";
import { $userId } from "../../../auth/store/authStore";
import { loadCoins } from "../../../coins/store/coinsStore";
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
} from "../stores/pokerIndex";

let reentryAttempts = 0;

socketMessageReceived.watch((data) => {
  if (data.type !== "poker") return;

  console.log("📩 [WS] Mensaje de poker:", data.action, data);

  switch (data.action) {
    case "match_ready": {
      const tableId = $currentTableId.getState();
      console.log(
        "🎯 match_ready recibido – Redirigiendo si hay mesa:",
        tableId
      );
      if (tableId !== null) {
        matchReadyReceived(tableId);
      } else {
        console.warn("⚠️ No se encontró una mesa activa en el store.");
      }
      break;
    }

    case "players_initialized": {
      const userId = $userId.getState();
      console.log("[players_initialized] userId local:", userId);

      if (!userId && reentryAttempts < 5) {
        console.warn(
          "🛑 userId aún no está disponible. Reintentando en 50ms..."
        );
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

      console.log("🙋‍♂️ Jugadores inicializados:", players);
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
      console.log("🃏 Mano inicial recibida:", cards);
      myHandUpdated(cards);
      break;
    }

    case "blinds_assigned":
      console.log("💸 Blinds asignados:", {
        dealer: data.dealer,
        smallBlind: data.smallBlind,
        bigBlind: data.bigBlind,
      });
      blindsAssigned({
        dealer: data.dealer,
        smallBlind: data.smallBlind,
        bigBlind: data.bigBlind,
      });
      break;

    case "start_betting": {
      console.log("🔥 Comienza la fase de apuestas:", data.phase);
      pokerPhaseChanged(data.phase);
      break;
    }

    case "your_turn": {
      console.log("⏱️ ¡Es tu turno!", data);
      myTurnStarted();
      validMovesUpdated(data.validMoves);
      callAmountUpdated(data.callAmount ?? 0);
      maxRaiseUpdated(data.maxRaise ?? 0);
      break;
    }

    case "turn_timer": {
      console.log("⏳ Temporizador de turno:", data.time);
      turnCountdownSet(data.time);
      turnCountdownTotalSet(data.time);
      break;
    }

    case "bet_confirmed":
      console.log("✅ Apuesta confirmada:", data);
      betConfirmedReceived({
        userId: data.userId,
        bet: data.bet,
        totalBet: data.totalBet,
      });
      loadCoins();
      break;

    case "player_action":
      console.log("📤 Acción de jugador finalizada");
      myTurnEnded();
      break;

    case "round_result":
      console.log("🏁 Resultado de ronda recibido:", data.summary);
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
      console.log("🃏 Flop recibido:", cards);
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
      console.log("🃏 Turn recibido:", cards);
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
      console.log("🃏 River recibido:", cards);
      pokerPhaseChanged("river");
      myTurnEnded();
      communityCardsUpdated(cards);
      break;
    }

    case "removed_by_inactivity":
      console.log("🚫 Jugador eliminado por inactividad");
      removedByInactivity();
      break;

    case "opponent_left":
      console.log("👤 [WS] El oponente ha abandonado");
      opponentLeftReceived();
      break;

    default:
      console.warn("🤷‍♂️ Acción desconocida:", data.action);
      break;
  }
});
