import { createStore } from "effector";
import { Card, PlayerPoker } from "../interfaces/poker.interfaces";
import {
  betConfirmedReceived,
  blindsAssigned,
  callAmountUpdated,
  communityCardsUpdated,
  currentTurnChanged,
  decrementTurnCountdown,
  matchPlayersInitialized,
  maxRaiseUpdated,
  myHandUpdated,
  myTurnEnded,
  myTurnStarted,
  pokerPhaseChanged,
  turnCountdownSet,
  validMovesUpdated,
} from "./pokerEvents";

// 🧑‍🤝‍🧑 Jugadores
export const $pokerPlayers = createStore<PlayerPoker[]>([])
  .on(matchPlayersInitialized, (_, players) => players)

  .on(blindsAssigned, (players, { dealer, smallBlind, bigBlind }) =>
    players.map((p) => {
      let role: PlayerPoker["role"] = null;
      let currentBet = p.currentBet ?? 0;
      let totalBet = p.totalBet ?? 0;

      if (p.id === dealer.userId) {
        role = "dealer";
      }

      if (p.id === smallBlind.userId) {
        role = "sb";
        currentBet = smallBlind.amount;
        totalBet = smallBlind.amount;
      }

      if (p.id === bigBlind.userId) {
        role = "bb";
        currentBet = bigBlind.amount;
        totalBet = bigBlind.amount;
      }

      return {
        ...p,
        role,
        currentBet,
        totalBet,
      };
    })
  )

  .on(betConfirmedReceived, (players, { userId, bet, totalBet }) =>
    players.map((p) =>
      p.id === userId ? { ...p, currentBet: bet, totalBet } : p
    )
  );

// 🎮 Fase del juego
export const $pokerPhase = createStore<
  "preflop" | "flop" | "turn" | "river" | "showdown"
>("preflop").on(pokerPhaseChanged, (_, phase) => phase);

// 🃏 Cartas
export const $communityCards = createStore<Card[]>([]).on(
  communityCardsUpdated,
  (_, cards) => cards
);

export const $myHand = createStore<Card[]>([]).on(
  myHandUpdated,
  (_, cards) => cards
);

// ⏱️ Turno actual
export const $currentTurnUserId = createStore<number | null>(null).on(
  currentTurnChanged,
  (_, id) => id
);

export const $isMyTurn = createStore<boolean>(false)
  .on(myTurnStarted, () => true)
  .on(myTurnEnded, () => false);

// 🎯 Opciones y límites de movimiento
export const $validMoves = createStore<string[]>([]).on(
  validMovesUpdated,
  (_, moves) => moves
);

export const $callAmount = createStore<number>(0, { skipVoid: false }).on(
  callAmountUpdated,
  (_, amount) => amount ?? 0
);

export const $maxRaise = createStore<number>(0, { skipVoid: false }).on(
  maxRaiseUpdated,
  (_, amount) => amount ?? 0
);

// ⏱️ Temporizador de turno
export const $turnCountdown = createStore<number>(20)
  .on(turnCountdownSet, (_, value) => value)
  .on(decrementTurnCountdown, (time) => Math.max(time - 1, 0));

