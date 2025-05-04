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

export interface RoundSummary {
  winners: {
    userId: number;
    nickname: string;
    amountWon: number;
    handDescription: string;
  }[];
  pot: number;
}

export interface Card {
  rank: string;
  suit: string;
  value: number;
}