import { FC } from "react";
import { PotResult } from "../interfaces/poker.interfaces";
import { translatePokerHandDescription } from "../utils/translatePokerHandDescription";

interface Props {
  summary: PotResult[];
}

export const RoundResult: FC<Props> = ({ summary }) => {
  if (!Array.isArray(summary) || summary.length === 0) return null;

  return (
    <div className="bg-black/70 rounded-2xl p-6 mt-8 shadow-lg max-w-3xl mx-auto border border-Coins">
      <h2 className="text-2xl sm:text-3xl font-extrabold text-center text-Coins mb-6 drop-shadow-md">
        🏆 Resultado de la Ronda
      </h2>

      <ul className="divide-y divide-white/10">
        {summary.map((result, index) => (
          <li
            key={`${result.potType}-${index}`}
            className="py-4 px-2 text-white text-xl"
          >
            {/* Escritorio */}
            <div className="hidden sm:grid sm:grid-cols-4 sm:gap-4">
              <span className="text-white/70 font-semibold">{result.potType}</span>
              <span className="font-bold text-Principal">{result.nickname}</span>
              <span className="text-white/80">{translatePokerHandDescription(result.description)}</span>
              <span className="font-bold text-Coins text-right">+{result.amount} fichas</span>
            </div>

            {/* Móvil */}
            <div className="sm:hidden text-center space-y-1">
              <div className="flex justify-center items-center gap-3">
                <span className="text-white/70">{result.potType}</span>
                <span className="text-Principal font-bold">{result.nickname}</span>
                <span className="text-Coins font-bold">+{result.amount} fichas</span>
              </div>
              <div className="text-white/90">
                {translatePokerHandDescription(result.description)}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
