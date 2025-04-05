import { CardRank, GameType, Suit } from "../types/gameCard.type";

export interface GameCard {
    suit: Suit;
    rank: CardRank;
    value: number;
    gameType: GameType;
  }  