import { useEffect, useState } from "react";
import { useUnit } from "effector-react";

import { spinResult$ } from "../stores/rouletteStores";
import { betsClosed$ } from "../stores/rouletteStores";
import { isPaused$ } from "../stores/rouletteStores";
import { $currentTableId } from "../../../gameTables/store/tablesStores";
import { $coins, loadCoins } from "../../../coins/store/coinsStore";

import { requestGameState } from "../stores/rouletteEvents";
import { RouletteBetBoard } from "../components/RouletteBetBoard";

type LocalBet = {
  key: string;
  label: string;
  amount: number;
};

function RouletteGamePage() {
  const spinResult = useUnit(spinResult$);
  const isBetsClosed = useUnit(betsClosed$);
  const isPaused = useUnit(isPaused$);
  const tableId = useUnit($currentTableId);
  const coins = useUnit($coins);

  const [betAmount, setBetAmount] = useState(0);
  const [bets, setBets] = useState<LocalBet[]>([]);

  useEffect(() => {
    if (tableId) requestGameState(tableId);
    loadCoins();
  }, [tableId]);

  const number = spinResult?.result?.number ?? "-";
  const color = spinResult?.result?.color ?? "-";

  const handleIncrement = (amount: number) => {
    setBetAmount((prev) => Math.min(prev + amount, coins));
  };

  const handleReset = () => {
    setBetAmount(0);
  };

  const handleBetClick = (bet: string | number) => {
    if (isBetsClosed || betAmount <= 0 || betAmount > coins) return;

    const key = typeof bet === "number" ? `number_${bet}` : bet;
    const label = typeof bet === "number" ? `${bet}` : bet.toUpperCase();

    const alreadyBet = bets.find((b) => b.key === key);
    if (alreadyBet) return;

    setBets((prev) => [...prev, { key, label, amount: betAmount }]);

    loadCoins();
  };


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-900 bg-repeat p-6 text-white font-mono">
      <h1 className="text-7xl text-center font-bold mb-6 drop-shadow">♠️ Ruleta</h1>

      {isPaused ? (
        <h2 className="text-3xl font-bold text-red-500 mb-6">Ruleta pausada por inactividad</h2>
      ) : (
        <>
          <h2 className="text-2xl mb-4">Número ganador: {number}</h2>
          <h2 className="text-2xl mb-4">Color ganador: {color}</h2>

          <div className="bg-black/30 p-4 rounded-xl mb-6 w-full max-w-md text-white">
            <h3 className="text-xl mb-2 font-bold text-center">Selecciona tu apuesta</h3>
            <div className="flex gap-3 justify-center">
              {[5, 10, 25, 50, 100].map((val) => (
                <button
                  key={val}
                  onClick={() => handleIncrement(val)}
                  className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-black font-bold rounded shadow"
                >
                  +{val}
                </button>
              ))}
              <button
                onClick={handleReset}
                className="text-sm text-red-300 hover:underline ml-2"
              >
                Reset
              </button>
            </div>

            <p className="text-center mt-4 text-lg">
              Apuesta actual:{" "}
              <span className="text-green-400 font-bold">{betAmount} fichas</span>
            </p>

            {betAmount > coins && (
              <p className="text-center text-red-400 text-sm mt-2">
                No tienes suficientes fichas 💸
              </p>
            )}
          </div>

          <RouletteBetBoard
            disabled={isBetsClosed || betAmount <= 0 || betAmount > coins}
            onBet={handleBetClick}
            bets={bets}
          />

          <div className="bg-black/20 mt-8 p-4 rounded-xl w-full max-w-md text-white">
            <h3 className="text-xl font-bold mb-2">🎯 Tus apuestas</h3>
            {bets.length === 0 && <p>No has apostado aún.</p>}
            <ul className="space-y-2">
              {bets.map((bet) => (
                <li key={bet.key} className="flex justify-between">
                  <span>{bet.label}</span>
                  <span className="font-bold text-yellow-300">{bet.amount} fichas</span>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

export default RouletteGamePage;
