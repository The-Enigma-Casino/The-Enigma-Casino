import { useState } from "react";
import { RouletteBetBoard } from "../components/RouletteBetBoard";
import RouletteWheel from "../components/RouletteWheel";


function RouletteGamePage() {
  const [number, setNumber] = useState(0);

  return (
    <div className="p-6">
      <h1 className="text-4xl font-bold text-white mb-4">Ruleta</h1>

      <div className="flex flex-col items-center justify-center gap-6 min-h-screen bg-black text-white">
        <RouletteWheel resultNumber={number} />
        <button
          onClick={() => setNumber(Math.floor(Math.random() * 37))}
          className="bg-yellow-400 px-6 py-3 rounded-xl font-bold text-black"
        >
          Girar
        </button>
      </div>

      <RouletteBetBoard />
    </div>
  );
}

export default RouletteGamePage;
