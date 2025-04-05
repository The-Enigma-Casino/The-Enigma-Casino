import { GameCard } from '../interfaces/gameCard.interface';

export function calculateHandTotal(hand: GameCard[]): number {
  let total = 0;
  let aces = 0;

  for (const card of hand) {
    if (card.rank === 'Ace') {
      total += 11;
      aces += 1;
    } else if (['Jack', 'Queen', 'King'].includes(card.rank)) {
      total += 10;
    } else {
      total += card.value;
    }
  }

  // Ajuste para los Aces si es necesario
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }

  return total;
}
