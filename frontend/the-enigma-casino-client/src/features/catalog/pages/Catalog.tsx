import { useState } from "react";
import CoinsCard from "../components/CoinsCard";
import PaymentMethod from "../components/PaymentMethod";
import { CoinsPack } from "../models/CoinsPack.interface";

const Catalog = () => {
  const [selectedCard, setSelectedCard] = useState<number | null>(null);


  const packs: CoinsPack[] = [
    { id: 1, price: 1000, quantity: 100, image: "/img/pack1.webp", offer: 100 },
    { id: 2, price: 2000, quantity: 200, image: "/img/pack1.webp", offer: 0 },
    { id: 3, price: 5000, quantity: 500, image: "/img/pack1.webp", offer: 0 },
    { id: 4, price: 10000, quantity: 1000, image: "/img/pack1.webp", offer: 0 },
    { id: 5, price: 20000, quantity: 2000, image: "/img/pack1.webp", offer: 0 },
    { id: 6, price: 50000, quantity: 5000, image: "/img/pack1.webp", offer: 0 },
  ];

  const handleSelect = (id: number) => {
    setSelectedCard(id === selectedCard ? null : id);
  };

  return (
    <div className="flex flex-col md:flex-row bg-Background-Page">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 md:gap-6 md:p-6 flex-grow">
        {packs.map((pack) => (
          <CoinsCard
            key={pack.id}
            id={pack.id}
            price={pack.price}
            quantity={pack.quantity}
            image={pack.image}
            offer={pack.offer}
            isSelected={pack.id === selectedCard}
            onSelect={handleSelect}
          />
        ))}
      </div>
      <div className="mt-4 md:mt-0 md:ml-4 p-4 flex items-center">
        <PaymentMethod />
      </div>
    </div>
  );
};

export default Catalog;
