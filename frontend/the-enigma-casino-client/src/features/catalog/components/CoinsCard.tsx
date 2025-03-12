import React from "react";
import { selectCard } from "../store/catalogStore";
import { convertCentsToEuros } from "../../../utils/priceUtils";
import { BASE_URL } from "../../../config"

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

const CoinsCard: React.FC<CoinsProps> = ({ id, price, quantity, image, size = "small", isSelected = false, onSelect = () => { }, offer, clickable = true }) => {
  const containerClasses = size === "large"
    ? "w-[50rem] h-[40rem]"
    : "w-[25rem] h-[30rem]"; // Small

  const imageClasses = size === "large"
    ? "w-[25rem] h-[25rem]"
    : "w-[15rem] h-[15rem]"; // Small

  const selectedClasses = isSelected ? "border-2 border-Principal" : "";
  const cursorClass = clickable ? "cursor-pointer" : "";

  console.log(image)

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

  return (
    <div className={`flex items-center justify-center md:flex-col`} onClick={handleSelection}>
      <div
        className={`bg-Background-Overlay rounded-3xl p-6 shadow-lg text-center flex flex-col items-center justify-center ${containerClasses} hover:Principal
                *:transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:bg-Background-Overlay hover:border-amber-40 hover:shadow-[0_0_20px_5px_#74c410] ${cursorClass} ${selectedClasses}`}
      >
        <div className="relative">
          <img
            src={`${BASE_URL}${image}`}
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
              <p className="text-xl font-bold">{convertCentsToEuros(price)} €</p>
            </div>
          )}
          <div className="border-2 border-Principal text-white px-4 py-2 rounded-full">
            <p className="text-xl font-bold">{offer > 0 ? convertCentsToEuros(offer) : convertCentsToEuros(price)} €</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoinsCard;
