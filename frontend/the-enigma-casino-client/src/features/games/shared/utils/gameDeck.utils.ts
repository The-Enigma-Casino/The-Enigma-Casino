
import { GameCard } from '../interfaces/gameCard.interface';
import {CardRank, GameType, Suit } from '../types/gameCard.type';

const suits: Suit[] = ['Spades', 'Hearts', 'Diamonds', 'Clubs'];
const ranks: CardRank[] = [
  'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight',
  'Nine', 'Ten', 'Jack', 'Queen', 'King', 'Ace',
];

function getCardValue(rank: CardRank, gameType: GameType): number {
  if (gameType === 'BlackJack') {
    switch (rank) {
      case 'Two': return 2;
      case 'Three': return 3;
      case 'Four': return 4;
      case 'Five': return 5;
      case 'Six': return 6;
      case 'Seven': return 7;
      case 'Eight': return 8;
      case 'Nine': return 9;
      case 'Ten':
      case 'Jack':
      case 'Queen':
      case 'King': return 10;
      case 'Ace': return 11;
    }
  }
  return 0; // puedes ajustar esto según el juego
}

export class Deck {
  private cards: GameCard[];

  constructor(private gameType: GameType) {
    this.cards = [];

    for (const suit of suits) {
      for (const rank of ranks) {
        this.cards.push({
          suit,
          rank,
          value: getCardValue(rank, gameType),
          gameType,
        });
      }
    }

    this.shuffle();
  }

  private shuffle() {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  public draw(): GameCard {
    if (this.cards.length === 0) throw new Error('Deck is empty');
    return this.cards.shift()!;
  }
}
