import { Croupier, GameState, Player } from "../shared/types";

// Asegúrate de importar el tipo correctoimport { Player } from '../shared/types';
export const mockPlayers: Player[] = [
  {
    id: 1,
    userId: 1,
    name: 'Alice',
    hand: [
      { suit: 'Spades', rank: 'Ace', value: 11, gameType: 'BlackJack' },
      { suit: 'Clubs', rank: 'King', value: 10, gameType: 'BlackJack' }
    ],
    bet: 100,
    state: 'Win',
    gameTableId: 1,
    gameMatchId: 1,
  },
  {
    id: 2,
    userId: 2,
    name: 'Bob',
    hand: [
      { suit: 'Diamonds', rank: 'Nine', value: 9, gameType: 'BlackJack' },
      { suit: 'Spades', rank: 'Seven', value: 7, gameType: 'BlackJack' }
    ],
    bet: 50,
    state: 'Playing',
    gameTableId: 1,
    gameMatchId: 1,
  },
  {
    id: 3,
    userId: 3,
    name: 'Charlie',
    hand: [
      { suit: 'Hearts', rank: 'Five', value: 5, gameType: 'BlackJack' },
      { suit: 'Spades', rank: 'Ten', value: 10, gameType: 'BlackJack' }
    ],
    bet: 75,
    state: 'Stand',
    gameTableId: 1,
    gameMatchId: 1,
  }
];

export const mockCroupier: Croupier = {
  hand: [
    { suit: 'Hearts', rank: 'Ten', value: 10, gameType: 'BlackJack' },
    { suit: 'Clubs', rank: 'Six', value: 6, gameType: 'BlackJack' }
  ]
};

export const initialGameState: GameState = 'InProgress';