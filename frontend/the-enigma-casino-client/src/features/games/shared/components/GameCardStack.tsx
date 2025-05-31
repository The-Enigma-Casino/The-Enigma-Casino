import { CARD_IMAGE } from "../../../../config";
import { GameCard } from "../interfaces/gameCard.interface";

type Props = {
  cards: GameCard[];
  total?: number;
  hidden?: boolean;
  hideAll?: boolean;
  gameType: "poker" | "blackjack";
};

const getCardImageUrl = (card: GameCard) => {
  return `${CARD_IMAGE}/${card.suit.toLowerCase()}/${card.rank.toLowerCase()}`;
};

const getCardBackImage = (gameType: "poker" | "blackjack") => {
  return `/img/carta_${gameType}.webp`;
};

export const CardStack = ({
  cards,
  total,
  hidden = false,
  hideAll = false,
  gameType,
}: Props) => {
  return (
    <div className="w-full overflow-x-auto">
      <div className="flex justify-center items-end gap-2 min-w-fit px-2">
        {cards.map((card, index) => {
          const imageUrl = getCardImageUrl(card);
          const backImageUrl = getCardBackImage(gameType);

          return (
            <div
              key={index}
              className="h-40 sm:h-44 md:h-48 aspect-[5/7] rounded-md flex items-center justify-center text-lg font-bold shadow flex-shrink-0"
            >
              {hideAll || (hidden && index === 0) ? (
                <img
                  src={backImageUrl}
                  alt="card-back"
                  className="w-full h-full"
                />
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
