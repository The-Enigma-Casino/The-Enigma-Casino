import React from "react";
import { selectCard } from "../store/paymentStore";
import { convertCentsToEuros } from "../../../utils/priceUtils";


interface CoinsProps {
  id: number;
  price: number;
  quantity: number;
  image: string;
  offer: number;
  size?: "small" | "large";
  isSelected?: boolean;
  onSelect?: (id: number) => void;
}

const CoinsCard: React.FC<CoinsProps> = ({ id, price, quantity, image, size = "small", isSelected = false, onSelect = () => { }, offer }) => {
  const containerClasses = size === "large"
    ? "w-[50rem] h-[40rem]"
    : "w-[25rem] h-[30rem]"; //Small

  const imageClasses = size === "large"
    ? "w-[25rem] h-[25rem]"
    : "w-[15rem] h-[15rem]"; //Small

  const selectedClasses = isSelected ? "border-2 border-Principal" : "";


  const handleSelection = () => {
    const selectedData = { id, price, quantity, image, offer };
    selectCard(selectedData);
    onSelect(id);
  };


  return (
    <div className={`flex items-center justify-center`} onClick={handleSelection}>
      <div
        className={`bg-Background-Overlay rounded-3xl p-6 shadow-lg text-center flex flex-col items-center justify-center ${containerClasses} hover:Principal
                *:transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:bg-Background-Overlay hover:border-amber-40 hover:shadow-[0_0_20px_5px_#74c410] cursor-pointer ${selectedClasses}`}
      >
        <div className="relative">
          <img
            src={image || "/img/pack1.webp"}
            alt="pack"
            className={`object-cover rounded-lg ${imageClasses}`}
          />

          {offer > 0 && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-2xl font-bold px-3 py-1 rounded-full">
              % OFERTA
            </div>
          )}
        </div>

        <p className="text-Coins font-bold mt-4 text-4xl">
          {quantity || 120} Fichas
        </p>

        <div className="flex items-center gap-4 mt-4">
          {offer > 0 && (
            <div className="border-2 border-Principal text-red-500 px-4 py-2 rounded-full line-through">
              <p className="text-xl font-bold">{convertCentsToEuros(price)} €</p>
            </div>
          )}
          <div className="border-2 border-Principal text-white px-4 py-2 rounded-full">
            <p className="text-xl font-bold">{offer > 0 ? convertCentsToEuros(offer) : convertCentsToEuros(price)} €</p>
          </div>
        </div>
      </div>
    </div >
  );
};

export default CoinsCard;
