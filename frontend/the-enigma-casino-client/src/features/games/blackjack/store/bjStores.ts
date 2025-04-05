import { createStore } from "effector";
import { Player, Croupier, GameState } from "../../shared/types";
import {
  setPlayers,
  setCroupier,
  setGameState,
  resetPlayers,
  resetCroupier,
  resetGameState,
  playerHit,
  playerStand,
  doubleDown,
} from "./bjEvents";
import { initialGameState, mockCroupier, mockPlayers } from "../mockData";
import { GameCard } from "../../shared/interfaces/gameCard.interface";
import { CardRank, Suit } from "../../shared/types/gameCard.type";

// Función actualizada para devolver un objeto Card
function drawRandomCard(): GameCard {
  const values: { rank: CardRank; value: number }[] = [
    { rank: "Two", value: 2 },
    { rank: "Three", value: 3 },
    { rank: "Four", value: 4 },
    { rank: "Five", value: 5 },
    { rank: "Six", value: 6 },
    { rank: "Seven", value: 7 },
    { rank: "Eight", value: 8 },
    { rank: "Nine", value: 9 },
    { rank: "Ten", value: 10 },
    { rank: "Jack", value: 10 },
    { rank: "Queen", value: 10 },
    { rank: "King", value: 10 },
    { rank: "Ace", value: 11 },
  ];

  const suits: Suit[] = ['Spades', 'Hearts', 'Diamonds', 'Clubs'];
  
  const value = values[Math.floor(Math.random() * values.length)];
  const suit = suits[Math.floor(Math.random() * suits.length)];

  return {
    suit: suit,
    rank: value.rank,
    value: value.value,
    gameType: "BlackJack",
  };
}

export const $players = createStore<Player[]>(mockPlayers)
  .on(setPlayers, (_, players) => players)
  .on(resetPlayers, () => mockPlayers)
  .on(playerHit, (state, playerId) => {
    return state.map((p) =>
      p.id === playerId
        ? {
            ...p,
            hand: [...p.hand, drawRandomCard()], // Ahora agrega un objeto Card
          }
        : p
    );
  })
  .on(playerStand, (state, playerId) => {
    return state.map((p) => (p.id === playerId ? { ...p, state: "Stand" } : p));
  })
  .on(doubleDown, (state, playerId) => {
    return state.map((p) =>
      p.id === playerId
        ? {
            ...p,
            bet: p.bet * 2,
            hand: [...p.hand, drawRandomCard()], // Ahora agrega un objeto Card
            state: "Stand",
          }
        : p
    );
  });

export const $croupier = createStore<Croupier>(mockCroupier)
  .on(setCroupier, (_, croupier) => croupier)
  .on(resetCroupier, () => mockCroupier);

export const $gameState = createStore<GameState>(initialGameState)
  .on(setGameState, (_, state) => state)
  .on(resetGameState, () => initialGameState);