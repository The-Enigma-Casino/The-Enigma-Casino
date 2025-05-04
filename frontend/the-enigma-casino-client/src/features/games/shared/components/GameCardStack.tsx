import { CARD_IMAGE, CARD_IMAGE_BACK } from "../../../../config";
import { GameCard } from "../interfaces/gameCard.interface";

type Props = {
  cards: GameCard[];
  total?: number;
  hidden?: boolean;
};

const getCardImageUrl = (card: GameCard) => {
  return `${CARD_IMAGE}/${card.suit.toLowerCase()}/${card.rank.toLowerCase()}`;
};

const getCardBackImage = (version: number) => {
  return `${CARD_IMAGE_BACK}/${version}`;
};

export const CardStack = ({ cards, total, hidden = false }: Props) => {
  return (
    <div className="w-full overflow-x-auto">
      <div className="flex justify-center items-end gap-2 min-w-fit px-2">
        {cards.map((card, index) => {
          const imageUrl = getCardImageUrl(card);
          const backImageUrl = getCardBackImage(Math.random() < 0.5 ? 1 : 2);

          return (
            <div
              key={index}
              className="w-20 h-28 bg-white border border-gray-600 rounded-md flex items-center justify-center text-lg font-bold shadow flex-shrink-0"
            >
              {hidden && index === 0 ? (
                <img src={backImageUrl} alt="card-back" className="w-full h-full" />
              ) : (
                <img
                  src={imageUrl}
                  alt={`${card.rank} of ${card.suit}`}
                  className="w-full h-full object-contain"
                />
              )}
            </div>
          );
        })}
      </div>

      {typeof total === "number" && (
        <span className="mt-2 text-sm font-semibold text-white">
          Total: {total}
        </span>
      )}
    </div>
  );
};
