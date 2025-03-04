import React from "react";

interface CoinsProps {
    id: number;
    price: number;
    quantity: number;
    image: string;
    offer: number;
    size?: "small" | "large";
}

const Coins: React.FC<CoinsProps> = ({ price, quantity, image, size = "small" }) => {

    const containerClasses = size === "large"
        ? "w-[50rem] h-[40rem]"
        : "w-[35rem] h-[35rem]";

    const imageClasses = size === "large"
        ? "w-[25rem] h-[25rem]"
        : "w-[20rem] h-[20rem]";

    return (
        <div className={`flex items-center justify-center `}>
            <div
                className={`bg-Background-Overlay rounded-3xl p-10 shadow-lg text-center flex flex-col items-center justify-center ${containerClasses}`}
            >
                <img
                    src={image || "/img/pack1.webp"}
                    alt="pack"
                    className={`object-cover rounded-lg ${imageClasses}`}
                />
                <p className="text-Coins font-bold mt-6 text-5xl">
                    {quantity || 120} Fichas
                </p>
                <div className=" border border-green-500 text-white px-8 py-3 rounded-full mt-6">
                    <p className="text-4xl font-bold">
                        {price || 100} €
                    </p>
                </div>

            </div>
        </div>
    );
};

export default Coins;