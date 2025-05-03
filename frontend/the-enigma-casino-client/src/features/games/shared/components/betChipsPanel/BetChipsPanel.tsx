import { Chip } from "../chip/Chip";

type Props = {
  onIncrement: (amount: number) => void;
  onReset: () => void;
  betAmount: number;
  coins: number;
};

const CHIP_VALUES = [
  { value: 5, color: "red" },
  { value: 10, color: "blue" },
  { value: 25, color: "green" },
  { value: 50, color: "orange" },
  { value: 100, color: "yellow" },
];

export const BetChipsPanel: React.FC<Props> = ({
  onIncrement,
  onReset,
  betAmount,
  coins,
}) => {
  return (
    <div className="bg-black/30 p-6 md:p-8 rounded-xl mb-6 w-full max-w-[480px] text-white mx-auto">
      <h3 className="text-xl mb-4 font-bold text-center">
        Selecciona tu apuesta
      </h3>

      <div className="hidden md:grid md:grid-cols-5 md:gap-4 md:justify-center md:mb-6">
        {CHIP_VALUES.map(({ value, color }) => (
          <Chip
            key={value}
            value={value}
            color={color as any}
            size="medium"
            mode="button"
            onClick={() => onIncrement(value)}
          />
        ))}
      </div>

      <div className="block md:hidden">
        <div className="flex justify-center gap-4 mb-4">
          {CHIP_VALUES.slice(0, 3).map(({ value, color }) => (
            <Chip
              key={value}
              value={value}
              color={color as any}
              size="medium"
              mode="button"
              onClick={() => onIncrement(value)}
            />
          ))}
        </div>
        <div className="flex justify-center gap-4 mb-6">
          {CHIP_VALUES.slice(3).map(({ value, color }) => (
            <Chip
              key={value}
              value={value}
              color={color as any}
              size="medium"
              mode="button"
              onClick={() => onIncrement(value)}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-center mb-4">
        <button
          onClick={onReset}
          className="px-3 py-1 rounded-full text-sm font-semibold text-red-400 border border-red-400 hover:bg-red-400 hover:text-black transition-all duration-200"
        >
          Resetear apuesta
        </button>
      </div>

      <p className="text-center mt-2 text-lg">
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
