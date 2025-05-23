import React from "react";
import { selectCard } from "../store/catalogStore";
import { convertCentsToEuros } from "../../../utils/priceUtils";
import { BASE_URL } from "../../../config";

interface CoinsProps {
  id: number;
  price: number;
  quantity: number;
  image: string;
  offer: number;
  size?: "small" | "large";
  isSelected?: boolean;
  onSelect?: (id: number) => void;
  clickable?: boolean;
}

const CoinsCard: React.FC<CoinsProps> = ({
  id,
  price,
  quantity,
  image,
  size = "small",
  isSelected = false,
  onSelect = () => {},
  offer,
  clickable = true,
}) => {
  const containerClasses =
    size === "large"
      ? "w-[90vw] sm:w-[32rem] md:w-[40rem] lg:w-[50rem] h-auto sm:h-[26rem] md:h-[32rem] lg:h-[40rem]"
      : "w-[90vw] sm:w-[20rem] md:w-[24rem] lg:w-[25rem] h-auto sm:h-[24rem] md:h-[28rem] lg:h-[30rem]";

  const imageClasses =
    size === "large"
      ? "w-[50vw] sm:w-[12rem] md:w-[18rem] lg:w-[25rem] h-auto sm:h-[12rem] md:h-[18rem] lg:h-[25rem]"
      : "w-[40vw] sm:w-[8rem] md:w-[10rem] lg:w-[15rem] h-auto sm:h-[8rem] md:h-[10rem] lg:h-[15rem]";

  const selectedClasses = isSelected ? "border-2 border-Principal" : "";
  const cursorClass = clickable ? "cursor-pointer" : "";

  // Lógica para manejar la selección y deselección
  const handleSelection = () => {
    if (!clickable) return;
    const selectedData = { id, price, quantity, image, offer };
    if (isSelected) {
      selectCard(null);
    } else {
      selectCard(selectedData);
    }
    onSelect(id);
  };

  const glowIfSelected = isSelected ? "shadow-[0_0_20px_5px_#74c410]" : "";

  return (
    <div
      className={`flex items-center justify-center md:flex-col`}
      onClick={handleSelection}
    >
      <div
        className={`bg-Background-Overlay rounded-3xl p-6 shadow-lg text-center flex flex-col items-center justify-center transition-all duration-300 transform lg:hover:scale-105 lg:hover:shadow-[0_0_20px_5px_#74c410] lg:hover:border-amber-400 lg:hover:bg-Background-Overlay active:scale-[0.98] ${containerClasses} ${cursorClass} ${selectedClasses} ${glowIfSelected}`}
      >
        <div className="relative">
          <img
            src={`${BASE_URL}${image}?${Date.now()}`}
            alt="pack"
            className={`object-cover rounded-lg ${imageClasses}`}
          />

          {offer > 0 && (
            <div className="absolute top-[-1rem] left-[-2rem] bg-Color-Cancel text-white text-2xl font-bold px-3 py-1 rounded-full">
              % OFERTA
            </div>
          )}
        </div>

        <p className="text-Coins font-bold mt-4 text-4xl">
          {quantity || 120} Fichas
        </p>

        <div className="flex items-center gap-4 mt-4">
          {offer > 0 && (
            <div className="border-2 border-Principal text-Color-Cancel px-4 py-2 rounded-full line-through">
              <p className="text-xl font-bold">
                {convertCentsToEuros(price)} €
              </p>
            </div>
          )}
          <div className="border-2 border-Principal text-white px-4 py-2 rounded-full">
            <p className="text-xl font-bold">
              {offer > 0
                ? convertCentsToEuros(offer)
                : convertCentsToEuros(price)}{" "}
              €
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoinsCard;
