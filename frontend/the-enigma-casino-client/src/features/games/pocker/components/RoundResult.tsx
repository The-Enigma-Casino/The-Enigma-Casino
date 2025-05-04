import { FC } from "react";
import { RoundSummary } from "../interfaces/poker.interfaces";


interface Props {
  summary: RoundSummary;
}

export const RoundResult: FC<Props> = ({ summary }) => {
  return (
    <div className="bg-black/60 rounded-lg p-4 mt-6 shadow-md max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-center text-yellow-300 mb-4">Resultado de la ronda</h2>
      <p className="text-center text-white mb-2">Bote total: <span className="font-bold">{summary.pot} fichas</span></p>
      <ul className="divide-y divide-white/10">
        {summary.winners.map((w) => (
          <li key={w.userId} className="py-2 text-white flex justify-between items-center">
            <span className="font-bold text-green-300">{w.nickname}</span>
            <span className="italic">{w.handDescription}</span>
            <span className="font-bold text-green-400">+{w.amountWon} fichas</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
