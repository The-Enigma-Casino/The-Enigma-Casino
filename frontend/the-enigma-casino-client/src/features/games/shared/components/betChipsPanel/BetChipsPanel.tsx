import React from "react";

type Props = {
  onIncrement: (amount: number) => void;
  onReset: () => void;
  betAmount: number;
  coins: number;
};

const CHIP_VALUES = [5, 10, 25, 50, 100];

const chipStyles: Record<number, string> = {
  5: "bg-red-600",
  10: "bg-blue-500",
  25: "bg-green-600",
  50: "bg-orange-500",
  100: "bg-yellow-400 border-2 border-yellow-600 text-black",
};

export const BetChipsPanel: React.FC<Props> = ({
  onIncrement,
  onReset,
  betAmount,
  coins,
}) => {
  return (
    <div className="bg-black/30 p-4 rounded-xl mb-6 w-full max-w-md text-white">
      <h3 className="text-xl mb-2 font-bold text-center">
        Selecciona tu apuesta
      </h3>

      <div className="flex gap-4 justify-center flex-wrap">
        {CHIP_VALUES.map((val) => (
          <button
            key={val}
            onClick={() => onIncrement(val)}
            className={`w-14 h-14 rounded-full shadow-md flex items-center justify-center font-bold text-white text-lg transform hover:scale-105 transition-all duration-150 ${chipStyles[val]}`}
          >
            {val}
          </button>
        ))}

        <button
          onClick={onReset}
          className="ml-2 px-3 py-1 rounded-full text-sm font-semibold text-red-400 border border-red-400 hover:bg-red-400 hover:text-black transition-all duration-200"
        >
          Resetear apuesta
        </button>
      </div>

      <p className="text-center mt-4 text-lg">
        Apuesta actual:{" "}
        <span className="text-green-400 font-bold">{betAmount} fichas</span>
      </p>

      {betAmount > coins && (
        <p className="text-center text-red-400 text-sm mt-2">
          No tienes suficientes fichas 💸
        </p>
      )}
    </div>
  );
};
