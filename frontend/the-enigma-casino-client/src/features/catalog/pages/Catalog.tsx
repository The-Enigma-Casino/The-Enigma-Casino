import { useEffect, useState } from "react";
import CoinsCard from "../components/CoinsCard";
import PaymentMethod from "../components/PaymentMethod";
import { useUnit } from "effector-react";
import { $coinsPacks, loadPack } from "../store/catalogStore"
import { resetPayment } from "../store/catalogStore";

const Catalog = () => {
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const coinsPacks = useUnit($coinsPacks);

  useEffect(() => {
    loadPack(); //Llama a la peticion
    resetPayment();
  }, []);


  const handleSelect = (id: number) => {
    setSelectedCard(id === selectedCard ? null : id);
  };

  return (
    <div className="flex flex-col md:flex-row bg-Background-Page h-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 md:gap-6 md:p-6 flex-grow">
        {coinsPacks.map((pack) => (
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
      <div className="mt-4 md:mt-0 md:ml-4 p-4 flex items-center justify-center">
        <PaymentMethod />
      </div>
    </div>
  );
};

export default Catalog;
