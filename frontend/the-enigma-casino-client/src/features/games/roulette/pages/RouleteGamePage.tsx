import { useEffect, useState } from "react";
import { useUnit } from "effector-react";

import {
  spinResult$,
  betsClosed$,
  isPaused$,
  lastResults$,
  isStopped$,
} from "../stores/rouletteStores";
import { $currentTableId } from "../../../gameTables/store/tablesStores";
import { $coins, loadCoins } from "../../../coins/store/coinsStore";

import {
  requestGameState,
  placeRouletteBet,
  betsOpenedReceived,
  resetSpinResult,
} from "../stores/rouletteEvents";
import { RouletteBetBoard } from "../components/RouletteBetBoard";

import type { PlaceRouletteBetPayload } from "../stores/rouletteEvents";

import "../stores/rouletteHandler";
import { countdownDecrement, syncedCountdown$ } from "../stores/rouletteClock";
import { RouletteHistory } from "../components/RouletteHistory";
import { CountdownBar } from "../../shared/components/countdownBar/CountdownBar";
import { RoulettePlayersPanel } from "../components/RoulettePlayersPanel";

type LocalBet = {
  key: string;
  label: string;
  amount: number;
};

function RouletteGamePage() {
  const spinResult = useUnit(spinResult$);
  const isBetsClosed = useUnit(betsClosed$);
  const isPaused = false;
  const tableId = useUnit($currentTableId);
  const countdown = useUnit(syncedCountdown$);
  const coins = useUnit($coins);
  const lastResults = useUnit(lastResults$);
  const isStopped = useUnit(isStopped$);

  const decrement = useUnit(countdownDecrement);

  const [betAmount, setBetAmount] = useState(0);
  const [bets, setBets] = useState<LocalBet[]>([]);

  useEffect(() => {
    if (tableId) requestGameState(tableId);
    loadCoins();
  }, [tableId]);

  useEffect(() => {
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

  useEffect(() => {
    return () => {
      resetSpinResult();
    };
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

  function didWin(spinResult: any): boolean {
    if (!spinResult || !Array.isArray(spinResult.bets)) return false;
    return spinResult.bets.some((b: any) => b.isWinner === true);
  }

  const getColorClass = (color: string) => {
    if (color === "red") return "text-red-500";
    if (color === "black") return "text-gray-300";
    if (color === "green") return "text-green-400";
    return "text-white";
  };

  const getBarColor = (countdown: number) => {
    if (countdown <= 5) return "bg-Color-Cancel";
    if (countdown <= 10) return "bg-orange-400";
    return "bg-Coins";
  };

  return (
    <div className="min-h-screen bg-green-900 bg-repeat p-6 text-white font-mono">
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
        {/* 🎮 Zona de juego */}
        <div className="flex flex-col items-center">
          <h1 className="text-7xl text-center font-bold mb-6 drop-shadow">
            ♠️ Ruleta
          </h1>

          {isPaused ? (
            <h2 className="text-3xl font-bold text-red-500 mb-6">
              Ruleta pausada por inactividad
            </h2>
          ) : (
            <>
              <h2 className={`text-5xl mb-4 font-bold ${getColorClass(color)}`}>
                {number}
              </h2>
              <h2 className={`text-2xl mb-6 font-bold ${getColorClass(color)}`}>
                {color.toUpperCase()}
              </h2>

              {spinResult && (
                <h2 className="text-xl mb-4 font-bold">
                  {didWin(spinResult) ? (
                    <span className="text-green-400">
                      ¡Ganaste una apuesta! 🎉
                    </span>
                  ) : (
                    <span className="text-red-400">
                      No acertaste esta vez. 😞
                    </span>
                  )}
                </h2>
              )}

              {isStopped && (
                <h2 className="text-3xl font-bold text-red-500 mb-6">
                  Ruleta detenida por inactividad prolongada
                </h2>
              )}

              <CountdownBar countdown={countdown} />

              <div className="bg-black/30 p-4 rounded-xl mb-6 w-full max-w-md text-white">
                <h3 className="text-xl mb-2 font-bold text-center">
                  Selecciona tu apuesta
                </h3>
                <div className="flex gap-3 justify-center">
                  {[5, 10, 25, 50, 100].map((val) => (
                    <button
                      key={val}
                      onClick={() => handleIncrement(val)}
                      className="px-4 py-2 bg-Coins hover:bg-yellow-500 text-black font-bold rounded shadow"
                    >
                      +{val}
                    </button>
                  ))}
                  <button
                    onClick={handleReset}
                    className="text-sm text-Color-Cancel hover:underline ml-2"
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

              {lastResults.length > 0 && (
                <div className="mb-6 text-center">
                  <h3 className="text-xl font-bold mb-2">
                    Últimos resultados:
                  </h3>
                  <RouletteHistory results={lastResults} />
                </div>
              )}
            </>
          )}
        </div>

        <RoulettePlayersPanel />
      </div>
    </div>
  );
}

export default RouletteGamePage;

// Función para construir la apuesta a enviar
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
