import { createStore } from "effector";
import {
  Card,
  PlayerPoker,
  PotResult,
} from "../interfaces/poker.interfaces";
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
  resetPokerGame,
  roundResultReceived,
  turnCountdownSet,
  turnCountdownTotalSet,
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
  )
  .reset(resetPokerGame);

// 🎮 Fase del juego
export const $pokerPhase = createStore<
  "preflop" | "flop" | "turn" | "river" | "showdown"
>("preflop")
  .on(pokerPhaseChanged, (_, phase) => phase)
  .reset(resetPokerGame);

// 🃏 Cartas
export const $communityCards = createStore<Card[]>([])
  .on(communityCardsUpdated, (_, cards) => cards)
  .reset(resetPokerGame);

export const $myHand = createStore<Card[]>([])
  .on(myHandUpdated, (_, cards) => cards)
  .reset(resetPokerGame);

// ⏱️ Turno actual
export const $currentTurnUserId = createStore<number | null>(null)
  .on(currentTurnChanged, (_, id) => id)
  .reset(resetPokerGame);

export const $isMyTurn = createStore<boolean>(false)
  .on(myTurnStarted, () => true)
  .on(myTurnEnded, () => false)
  .reset(resetPokerGame);

// 🎯 Opciones y límites de movimiento
export const $validMoves = createStore<string[]>([])
  .on(validMovesUpdated, (_, moves) => moves)
  .reset(resetPokerGame);

export const $callAmount = createStore<number>(0, { skipVoid: false })
  .on(callAmountUpdated, (_, amount) => amount ?? 0)
  .reset(resetPokerGame);

export const $maxRaise = createStore<number>(0, { skipVoid: false })
  .on(maxRaiseUpdated, (_, amount) => amount ?? 0)
  .reset(resetPokerGame);

export const $roundSummary = createStore<PotResult[] | null>(null)
  .on(roundResultReceived, (_, { summary }) => summary)
  .reset(resetPokerGame);

// ⏱️ Temporizador de turno
export const $turnCountdown = createStore<number>(20)
  .on(turnCountdownSet, (_, value) => value)
  .on(decrementTurnCountdown, (time) => Math.max(time - 1, 0))
  .reset(resetPokerGame);

export const $turnCountdownTotal = createStore<number>(20)
  .on(turnCountdownTotalSet, (_, value) => value)
  .reset(resetPokerGame);
