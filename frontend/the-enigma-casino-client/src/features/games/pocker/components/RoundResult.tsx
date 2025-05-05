import { FC } from "react";
import { PotResult } from "../interfaces/poker.interfaces";

interface Props {
  summary: PotResult[];
}

export const RoundResult: FC<Props> = ({ summary }) => {
  if (!Array.isArray(summary) || summary.length === 0) return null;

  return (
    <div className="bg-black/60 rounded-lg p-4 mt-6 shadow-md max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-center text-yellow-300 mb-4">
        Resultado de la ronda
      </h2>
      <ul className="divide-y divide-white/10">
        {summary.map((result, index) => (
          <li key={`${result.potType}-${index}`} className="py-2 text-white flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
            <span className="text-sm text-white/60">{result.potType}</span>
            <span className="font-bold text-green-300">{result.nickname}</span>
            <span className="italic">{result.description}</span>
            <span className="font-bold text-green-400">+{result.amount} fichas</span>
          </li>
        ))}
      </ul>
    </div>
  );
};