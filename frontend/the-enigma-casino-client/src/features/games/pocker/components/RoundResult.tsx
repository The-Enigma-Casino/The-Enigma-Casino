import { FC } from "react";
import { PotResult } from "../interfaces/poker.interfaces";
import { translatePokerHandDescription } from "../utils/translatePokerHandDescription";

interface Props {
  summary: PotResult[];
}

export const RoundResult: FC<Props> = ({ summary }) => {
  if (!Array.isArray(summary) || summary.length === 0) return null;

  return (
    <div className="bg-black/70 rounded-2xl p-6 mt-8 shadow-lg max-w-3xl mx-auto border border-yellow-500/40">
      <h2 className="text-3xl font-extrabold text-center text-yellow-300 mb-6 drop-shadow-md">
        🏆 Resultado de la Ronda
      </h2>
      <ul className="divide-y divide-white/10">
        {summary.map((result, index) => (
          <li
            key={`${result.potType}-${index}`}
            className="py-4 px-2 text-white grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-4 text-lg sm:text-xl"
          >
            <span className="text-white/70 font-semibold">{result.potType}</span>
            <span className="font-bold text-green-300">{result.nickname}</span>
            <span className=" text-white/80">{translatePokerHandDescription(result.description)}</span>
            <span className="font-bold text-green-400 text-right">+{result.amount} fichas</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
