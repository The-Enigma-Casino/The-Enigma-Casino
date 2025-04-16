import { GameCard } from "./interfaces/gameCard.interface";

export type PlayerState =
  | 'Waiting'
  | 'Playing'
  | 'Stand'
  | 'Bust'
  | 'Win'
  | 'Lose'
  | 'Draw'
  | 'Blackjack'; // Comprobar si funciona

export type MatchState = 'Waiting' | 'InProgress' | 'Finished';

export type Player = {
  id: number;
  userId: number;
  name: string;
  hand: GameCard[];
  gameTableId: number;
  gameMatchId?: number;
  state: PlayerState;
  bet: number;
};

export type Croupier = {
  hand: GameCard[];
};

export type GameState = MatchState; // alias para consistencia
