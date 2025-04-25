import React, { useEffect, useState } from "react";
import { GameStage } from "../enums/GameStage.enum";

type Props = {
  stage: GameStage;
  maxDuration: number;
  currentDuration: number;
};

const ProgressBarRound: React.FC<Props> = ({ stage, maxDuration, currentDuration }) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const duration = maxDuration - currentDuration;
    if (duration <= 0) return;

    let current = 0;
    const intervalMs = 100;
    const totalSteps = (duration * 1000) / intervalMs;
    const increment = 100 / totalSteps;

    const interval = setInterval(() => {
      current += increment;
      setValue(prev => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(interval);
          return 100;
        }
        return next;
      });
    }, intervalMs);

    return () => clearInterval(interval);
  }, [stage, maxDuration, currentDuration]);

  const getLabel = () => {
    switch (stage) {
      case GameStage.PLACE_BET:
        return "PLACE BET";
      case GameStage.NO_MORE_BETS:
        return "NO MORE BETS";
      case GameStage.WINNERS:
        return "WINNERS";
      default:
        return "";
    }
  };

  return (
    <div>
      <div className="text-center font-bold mb-2">{getLabel()}</div>
      <progress className="w-full h-2 bg-gray-200 rounded" value={value} max={100} />
    </div>
  );
};

export default ProgressBarRound;
