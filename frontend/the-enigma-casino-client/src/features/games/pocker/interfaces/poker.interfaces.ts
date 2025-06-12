import { GameCard } from "../../shared/interfaces/gameCard.interface";

export type PlayerState = "Playing" | "Fold" | "AllIn" | "Left" | "Win";

export type PlayerRole = "dealer" | "sb" | "bb" | null;

export interface PlayerPoker {
  id: number;
  nickname: string;
  coins: number;

  hand?: Card[];
  currentBet?: number;
  totalBet?: number;
  state?: PlayerState;
  role?: PlayerRole;
}

export interface PotResult {
  potType: string;
  userId: number;
  nickname: string;
  amount: number;
  description: string;
  hand: {
    suit: string;
    rank: string;
    value: number;
  }[];
}

export interface Card {
  rank: string;
  suit: string;
  value: number;
}

export interface RevealedHand {
  userId: number;
  cards: { rank: number; suit: number }[];
}

export interface RoundResultPayload {
  summary: PotResult[];
  revealedHands?: RevealedHand[];
}

export type GamePlayer = {
  id: number;
  nickName: string;
  hand: GameCard[];
  total?: number;
  bets?: { bet: string; amount: number }[];
  isTurn?: boolean;
  coins: number;
  currentBet?: number;
  totalBet?: number;
  role?: "dealer" | "sb" | "bb";
};
