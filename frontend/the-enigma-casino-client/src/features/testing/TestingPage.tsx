import { useState } from "react";
import { GameStage } from "./enums/GameStage.enum";
import { WheelNumber } from "./types/WheelNumber.type";
import Wheel from "./components/Wheel";
import ProgressBarRound from "./components/ProgressBarRound";

export const TestingPage = () => {
  const [number, setNumber] = useState<WheelNumber>({ next: null });
  const [stage, setStage] = useState<GameStage>(GameStage.PLACE_BET);
  const [timeRemaining, setTimeRemaining] = useState(0);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Zona de Pruebas de Ruleta</h1>

      <Wheel
        number={number}
        rouletteData={{
          numbers: [
            0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27,
            13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1,
            20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26,
          ],
        }}
      />

      <ProgressBarRound stage={stage} maxDuration={35} currentDuration={timeRemaining} />

      <div className="mt-4 space-x-2">
        <button onClick={() => setNumber({ next: prompt("Número a girar:") || "0" })} className="bg-blue-500 text-white px-4 py-2 rounded">Girar</button>
        <button onClick={() => setStage(GameStage.PLACE_BET)} className="bg-green-500 text-white px-4 py-2 rounded">PLACE_BET</button>
        <button onClick={() => setStage(GameStage.NO_MORE_BETS)} className="bg-yellow-500 text-white px-4 py-2 rounded">NO_MORE_BETS</button>
        <button onClick={() => setStage(GameStage.WINNERS)} className="bg-purple-500 text-white px-4 py-2 rounded">WINNERS</button>
      </div>
    </div>
  );
};
