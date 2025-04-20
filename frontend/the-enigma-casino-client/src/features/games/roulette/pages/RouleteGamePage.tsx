import { useState } from "react";
import { RouletteBetBoard } from "../components/RouletteBetBoard";
// import RouletteWheel from "../components/RouletteWheel";

function RouletteGamePage() {
  const [number, setNumber] = useState(0);
  const [color, setColor] = useState("black");

  const handleSpin = () => {
    const result = Math.floor(Math.random() * 37);
    setNumber(result);
    setColor("red");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-900 bg-repeat p-6 text-white font-mono">
      <h1 className="text-7xl text-center font-bold mb-6 drop-shadow">♠️ Ruleta</h1>
      <h2 className="text-2xl mb-4">Número ganador: {number}</h2>
      <h2 className="text-2xl mb-4">Color ganandor: {color}</h2>
      {/* <RouletteWheel winningNumber={number} /> */}
      <button
        onClick={handleSpin}
        className="mt-6 px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-black font-bold rounded"
      >
        Girar
      </button>
      <RouletteBetBoard />
    </div>
  );
}

export default RouletteGamePage;
