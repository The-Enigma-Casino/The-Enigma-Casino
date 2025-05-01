import { useEffect, useState } from "react";
import { useUnit } from "effector-react";

import {
  spinResult$,
  betsClosed$,
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

import "../stores/rouletteHandler";
import { countdownDecrement, syncedCountdown$ } from "../stores/rouletteClock";
import { RouletteHistory } from "../components/RouletteHistory";
import { CountdownBar } from "../../shared/components/countdownBar/CountdownBar";
import { RoulettePlayersPanel } from "../components/RoulettePlayersPanel";
import { LocalBet } from "../types/localBet.type";
import { buildBetPayload } from "../utils/buildBetPayload";

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

  function getResultMessage(spinResult: any): {
    message: string;
    colorClass: string;
  } {
    if (
      !spinResult ||
      !Array.isArray(spinResult.bets) ||
      spinResult.bets.length === 0
    ) {
      return {
        message: "No realizaste ninguna apuesta esta ronda.",
        colorClass: "text-red-400",
      };
    }

    const won = spinResult.bets.some((b: any) => b.isWinner === true);
    return won
      ? { message: "¡Ganaste una apuesta! 🎉", colorClass: "text-green-400" }
      : { message: "No acertaste esta vez. 😞", colorClass: "text-red-400" };
  }

  const getColorClass = (color: string) => {
    if (color === "red") return "text-red-500";
    if (color === "black") return "text-gray-300";
    if (color === "green") return "text-green-400";
    return "text-white";
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
                <h2
                  className={`text-xl mb-4 font-bold ${
                    getResultMessage(spinResult).colorClass
                  }`}
                >
                  {getResultMessage(spinResult).message}
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

        <div className="flex flex-col h-full max-h-screen">
          <RoulettePlayersPanel />
        </div>
      </div>
    </div>
  );
}

export default RouletteGamePage;
