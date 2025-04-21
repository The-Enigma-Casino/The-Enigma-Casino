import { useEffect, useState } from "react";
import { useEvent, useUnit } from "effector-react";

import { spinResult$, betsClosed$, isPaused$ } from "../stores/rouletteStores";
import { $currentTableId } from "../../../gameTables/store/tablesStores";
import { $coins, loadCoins } from "../../../coins/store/coinsStore";

import {
  requestGameState,
  placeRouletteBet,
  betsOpenedReceived,
} from "../stores/rouletteEvents";
import { RouletteBetBoard } from "../components/RouletteBetBoard";

import type { PlaceRouletteBetPayload } from "../stores/rouletteEvents";

import "../stores/rouletteHandler";
import { countdownDecrement, syncedCountdown$ } from "../stores/rouletteClock";

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
  const countdown = useUnit(syncedCountdown$);
  const coins = useUnit($coins);

  const decrement = useEvent(countdownDecrement);

  const [betAmount, setBetAmount] = useState(0);
  const [bets, setBets] = useState<LocalBet[]>([]);

  useEffect(() => {
    if (tableId) requestGameState(tableId);
    loadCoins();
  }, [tableId]);

  useEffect(() => {
    console.log("Spin result: ", spinResult);
    if (spinResult) {
      loadCoins();
    }
  }, [spinResult]);

  useEffect(() => {
    const interval = setInterval(() => {
      decrement();
    }, 1000);

    return () => clearInterval(interval);
  }, [decrement]);

  useEffect(() => {
    const unsub = betsOpenedReceived.watch(() => {
      setBets([]);
    });
    return () => unsub();
  }, []);

  const number = spinResult?.number ?? "-";
  const color = spinResult?.color ?? "-";

  const handleIncrement = (amount: number) => {
    setBetAmount((prev) => Math.min(prev + amount, coins));
  };

  const handleReset = () => {
    setBetAmount(0);
  };

  const handleBetClick = (bet: string | number) => {
    if (isBetsClosed || betAmount <= 0 || betAmount > coins || !tableId) return;

    const key = typeof bet === "number" ? `number_${bet}` : bet;
    const label = typeof bet === "number" ? `${bet}` : bet.toUpperCase();

    const alreadyBet = bets.find((b) => b.key === key);
    if (alreadyBet) return;

    setBets((prev) => [...prev, { key, label, amount: betAmount }]);

    const payload = buildBetPayload(tableId.toString(), key, betAmount);
    if (payload) placeRouletteBet(payload);

    loadCoins();
  };

  function didWin(bets: LocalBet[], result: any): boolean {
    if (!result || typeof result.number !== "number") return false;

    return bets.some((bet) => {
      if (bet.key === `number_${result.number}`) return true;
      if (bet.key === "sector_9" && result.color === "red") return true;
      if (bet.key === "sector_10" && result.color === "black") return true;

      const isEven = result.number !== 0 && result.number % 2 === 0;
      const isLow = result.number >= 1 && result.number <= 18;
      const isHigh = result.number >= 19 && result.number <= 36;

      if (bet.key === "sector_8" && isEven) return true;
      if (bet.key === "sector_11" && !isEven && result.number !== 0)
        return true;
      if (bet.key === "sector_7" && isLow) return true;
      if (bet.key === "sector_12" && isHigh) return true;

      if (bet.key === "sector_4" && result.number >= 1 && result.number <= 12)
        return true;
      if (bet.key === "sector_5" && result.number >= 13 && result.number <= 24)
        return true;
      if (bet.key === "sector_6" && result.number >= 25 && result.number <= 36)
        return true;

      const col1 = [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34];
      const col2 = [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35];
      const col3 = [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36];

      if (bet.key === "sector_1" && col1.includes(result.number)) return true;
      if (bet.key === "sector_2" && col2.includes(result.number)) return true;
      if (bet.key === "sector_3" && col3.includes(result.number)) return true;

      return false;
    });
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-900 bg-repeat p-6 text-white font-mono">
      <h1 className="text-7xl text-center font-bold mb-6 drop-shadow">
        ♠️ Ruleta
      </h1>

      {isPaused ? (
        <h2 className="text-3xl font-bold text-red-500 mb-6">
          Ruleta pausada por inactividad
        </h2>
      ) : (
        <>
          <h2 className="text-2xl mb-4">Número ganador: {number}</h2>
          <h2 className="text-2xl mb-4">Color ganador: {color}</h2>

          {spinResult && (
            <h2 className="text-xl mb-4 font-bold">
              {didWin(bets, spinResult) ? (
                <span className="text-green-400">¡Ganaste una apuesta! 🎉</span>
              ) : (
                <span className="text-red-400">No acertaste esta vez. 😞</span>
              )}
            </h2>
          )}

          <h2 className="text-xl mb-4">
            Tiempo restante para apostar:{" "}
            <span className="text-yellow-400 font-bold">{countdown}</span>s
          </h2>
          <div className="bg-black/30 p-4 rounded-xl mb-6 w-full max-w-md text-white">
            <h3 className="text-xl mb-2 font-bold text-center">
              Selecciona tu apuesta
            </h3>
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
              <span className="text-green-400 font-bold">
                {betAmount} fichas
              </span>
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

          {/* <div className="bg-black/20 mt-8 p-4 rounded-xl w-full max-w-md text-white">
            <h3 className="text-xl font-bold mb-2">🎯 Tus apuestas</h3>
            {bets.length === 0 && <p>No has apostado aún.</p>}
            <ul className="space-y-2">
              {bets.map((bet) => (
                <li key={bet.key} className="flex justify-between">
                  <span>{bet.label}</span>
                  <span className="font-bold text-yellow-300">
                    {bet.amount} fichas
                  </span>
                </li>
              ))}
            </ul>
          </div> */}
        </>
      )}
    </div>
  );
}

export default RouletteGamePage;

function buildBetPayload(
  tableId: string,
  key: string,
  amount: number
): PlaceRouletteBetPayload | undefined {
  if (key.startsWith("number_")) {
    const number = parseInt(key.split("_")[1]);
    return { tableId, amount, betType: "Straight", number };
  }

  if (key === "sector_9")
    return { tableId, amount, betType: "Color", color: "red" };
  if (key === "sector_10")
    return { tableId, amount, betType: "Color", color: "black" };
  if (key === "sector_8")
    return { tableId, amount, betType: "EvenOdd", evenOdd: "Even" };
  if (key === "sector_11")
    return { tableId, amount, betType: "EvenOdd", evenOdd: "Odd" };
  if (key === "sector_7")
    return { tableId, amount, betType: "HighLow", highLow: "Low" };
  if (key === "sector_12")
    return { tableId, amount, betType: "HighLow", highLow: "High" };
  if (key === "sector_4")
    return { tableId, amount, betType: "Dozen", dozen: 1 };
  if (key === "sector_5")
    return { tableId, amount, betType: "Dozen", dozen: 2 };
  if (key === "sector_6")
    return { tableId, amount, betType: "Dozen", dozen: 3 };
  if (key === "sector_1")
    return { tableId, amount, betType: "Column", column: 1 };
  if (key === "sector_2")
    return { tableId, amount, betType: "Column", column: 2 };
  if (key === "sector_3")
    return { tableId, amount, betType: "Column", column: 3 };

  console.warn("[Ruleta] Sector no reconocido:", key);
  return undefined;
}
