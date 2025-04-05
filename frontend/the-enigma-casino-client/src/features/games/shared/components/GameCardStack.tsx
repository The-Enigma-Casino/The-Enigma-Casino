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
    <div className="flex items-end gap-2 relative">
      {cards.map((card, index) => {
        const imageUrl = getCardImageUrl(card);
        const backImageUrl = getCardBackImage(index % 2 === 0 ? 1 : 2); 

        return (
          <div
            key={index}
            className="w-12 h-16 bg-white border border-gray-600 rounded-md flex items-center justify-center text-lg font-bold shadow"
            style={{
              transform: `translateX(${index * 10}px)`,
              backgroundColor: hidden && index === 0 ? "#991b1b" : "white",
              color: hidden && index === 0 ? "transparent" : "black",
            }}
          >
            {/* Si la carta está oculta, muestra el reverso */}
            {hidden && index === 0 ? (
              <img
                src={backImageUrl}
                alt="card-back"
                className="w-full h-full"
              />
            ) : (
              <img
                src={imageUrl} 
                alt={`${card.rank} of ${card.suit}`}
                className="w-full h-full"
              />
            )}
          </div>
        );
      })}
      {typeof total === "number" && (
        <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-sm font-semibold">
          {total}
        </span>
      )}
    </div>
  );
};
