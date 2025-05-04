import { FC, useState } from "react";
import { ActionButton } from "../../shared/components/buttonActions/ActionButton";

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

  return (
    <div className="flex flex-col items-center gap-4 mt-6">
      <div className="flex flex-wrap justify-center gap-2">
        {validMoves.includes("check") && (
          <ActionButton
            onClick={() => onAction("check")}
            label="Check"
            color="green"
          />
        )}
        {validMoves.includes("call") && (
          <ActionButton
            onClick={() => onAction("call", callAmount)}
            label={`Call ${callAmount}`}
            color="purple"
          />
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
            <ActionButton
              onClick={() => onAction("raise", raiseAmount)}
              label="Raise"
              color="yellow"
              disabled={raiseAmount <= 0 || raiseAmount > maxRaise}
            />
          </div>
        )}
        {validMoves.includes("all-in") && (
          <ActionButton
            onClick={() => onAction("all-in")}
            label="All-In"
            color="yellow"
          />
        )}
        {validMoves.includes("fold") && (
          <ActionButton
            onClick={() => onAction("fold")}
            label="Fold"
            color="gray"
          />
        )}
      </div>
    </div>
  );
};