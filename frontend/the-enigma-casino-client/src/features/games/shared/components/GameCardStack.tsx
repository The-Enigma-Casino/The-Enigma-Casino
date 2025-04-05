import { GameCard } from "../interfaces/gameCard.interface";

type Props = {
  cards: GameCard[];
  total?: number;
  hidden?: boolean;
};

const suitSymbols: Record<string, string> = {
  Spades: '♠',
  Hearts: '♥',
  Diamonds: '♦',
  Clubs: '♣',
};

export const CardStack = ({ cards, total, hidden = false }: Props) => {
  return (
    <div className="flex items-end gap-2 relative">
      {cards.map((card, index) => {
        const symbol = suitSymbols[card.suit];
        const text = hidden && index === 0 ? '🂠' : `${card.rank[0]}${symbol}`;

        return (
          <div
            key={index}
            className="w-12 h-16 bg-white border border-gray-600 rounded-md flex items-center justify-center text-lg font-bold shadow"
            style={{
              transform: `translateX(${index * 10}px)`,
              backgroundColor: hidden && index === 0 ? '#991b1b' : 'white',
              color: hidden && index === 0 ? 'transparent' : 'black',
            }}
          >
            {text}
          </div>
        );
      })}
      {typeof total === 'number' && (
        <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-sm font-semibold">
          {total}
        </span>
      )}
    </div>
  );
};
