import { useState } from "react";
import RouletteWheel from "../components/RouletteWheel";

function RouletteGamePage() {
  const [number, setNumber] = useState(0);

  const handleSpin = () => {
    const result = Math.floor(Math.random() * 37);
    setNumber(result);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
      <h1 className="text-4xl font-bold mb-6">Ruleta</h1>
      <RouletteWheel winningNumber={number} />
      <button
        onClick={handleSpin}
        className="mt-6 px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-black font-bold rounded"
      >
        Girar
      </button>
    </div>
  );
}

export default RouletteGamePage;
