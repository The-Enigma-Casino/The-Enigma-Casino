import { socketMessageReceived } from "../../../../websocket/store/wsIndex";
import {
  pokerPhaseChanged,
  communityCardsUpdated,
  validMovesUpdated,
  turnCountdownSet,
  myHandUpdated,
  callAmountUpdated,
  maxRaiseUpdated,
  myTurnEnded,
  myTurnStarted,
  blindsAssigned,
  betConfirmedReceived,
  matchPlayersInitialized,
  turnCountdownStart,
} from "../stores/pokerIndex";

socketMessageReceived.watch((data) => {
  if (data.type !== "poker") return;

  switch (data.action) {
    case "match_ready": {
      console.log("🎯 match_ready recibido");
      break;
    }

    case "players_initialized": {
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

    case "turn_timer": {
      turnCountdownStart(data.time);
      break;
    }

    case "bet_confirmed":
      betConfirmedReceived({
        userId: data.userId,
        bet: data.bet,
        totalBet: data.totalBet,
      });
      break;
      
    case "player_action":
    case "round_result":
      myTurnEnded();
      break;

    case "flop_dealt":
    case "turn_dealt":
    case "river_dealt": {
      const cards = data.cards.map((c: any) => ({
        suit: c.suit,
        rank: c.rank,
        value: 0,
        gameType: "Poker",
      }));
      myTurnEnded();
      communityCardsUpdated(cards);
      break;
    }

    default:
      break;
  }
});

