import { FC, useState } from "react";

interface Props {
  validMoves: string[];
  callAmount: number;
  maxRaise: number;
  onAction: (move: "fold" | "call" | "check" | "raise" | "all-in", amount?: number) => void;
}

export const ActionControls: FC<Props> = ({
  validMoves,
  callAmount,
  maxRaise,
  onAction,
}) => {
  const [raiseAmount, setRaiseAmount] = useState(0);

  const buttonClass =
    "px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded shadow disabled:opacity-50";

  return (
    <div className="flex flex-col items-center gap-4 mt-6">
      <div className="flex flex-wrap justify-center gap-2">
        {validMoves.includes("check") && (
          <button onClick={() => onAction("check")} className={buttonClass}>
            Check
          </button>
        )}
        {validMoves.includes("call") && (
          <button onClick={() => onAction("call", callAmount)} className={buttonClass}>
            Call {callAmount}
          </button>
        )}
        {validMoves.includes("raise") && (
          <div className="flex gap-2 items-center">
            <input
              type="number"
              className="w-24 px-2 py-1 text-black rounded"
              min={1}
              max={maxRaise}
              value={raiseAmount}
              onChange={(e) => setRaiseAmount(Number(e.target.value))}
            />
            <button
              onClick={() => onAction("raise", raiseAmount)}
              disabled={raiseAmount <= 0 || raiseAmount > maxRaise}
              className={buttonClass}
            >
              Raise
            </button>
          </div>
        )}
        {validMoves.includes("all-in") && (
          <button onClick={() => onAction("all-in")} className={buttonClass}>
            All-in
          </button>
        )}
        {validMoves.includes("fold") && (
          <button onClick={() => onAction("fold")} className={buttonClass}>
            Fold
          </button>
        )}
      </div>
    </div>
  );
};
