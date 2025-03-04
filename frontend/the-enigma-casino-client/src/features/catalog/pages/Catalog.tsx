import React from "react";
import CoinsCard from "../components/CoinsCard";

const Catalog = () => {
    const packs = [
        { id: 1, price: 1000, quantity: 100, image: "/img/pack1.webp", offer: 0 },
        { id: 2, price: 2000, quantity: 200, image: "/img/pack1.webp", offer: 0 },
        { id: 3, price: 5000, quantity: 500, image: "/img/pack1.webp", offer: 0 },
        { id: 4, price: 10000, quantity: 1000, image: "/img/pack1.webp", offer: 0 },
        { id: 5, price: 20000, quantity: 2000, image: "/img/pack1.webp", offer: 0 },
        { id: 6, price: 50000, quantity: 5000, image: "/img/pack1.webp", offer: 0 },
    ];

    return (
        <div className="bg-Background-Page">
            <div className="grid grid-cols-3 gap-4 p-4 md:gap-6 md:p-6">
                {packs.map((pack) => (
                    <CoinsCard
                        key={pack.id}
                        id={pack.id}
                        price={pack.price}
                        quantity={pack.quantity}
                        image={pack.image}
                        offer={pack.offer}
                    />
                ))}
            </div>
        </div>
    );
};

export default Catalog;
