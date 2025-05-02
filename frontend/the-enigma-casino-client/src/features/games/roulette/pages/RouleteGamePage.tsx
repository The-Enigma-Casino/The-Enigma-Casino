import { useEffect, useState } from "react";
import { useUnit } from "effector-react";

import {
  spinResult$,
  betsClosed$,
  lastResults$,
  isStopped$,
  $myInitialBets,
} from "../stores/rouletteStores";
import { $currentTableId } from "../../../gameTables/store/tablesStores";
import { $coins, loadCoins } from "../../../coins/store/coinsStore";

import {
  requestGameState,
  placeRouletteBet,
  betsOpenedReceived,
  resetSpinResult,
  requestWheelState,
} from "../stores/rouletteEvents";
import { RouletteBetBoard } from "../components/RouletteBetBoard";
import { countdownDecrement, syncedCountdown$ } from "../stores/rouletteClock";
import { RouletteHistory } from "../components/RouletteHistory";
import { CountdownBar } from "../../shared/components/countdownBar/CountdownBar";
import { RoulettePlayersPanel } from "../components/RoulettePlayersPanel";
import { LocalBet } from "../types/localBet.type";
import { buildBetPayload } from "../utils/buildBetPayload";
import Roulette from "../components/RouletteWheel";
import { BetChipsPanel } from "../../shared/components/betChipsPanel/BetChipsPanel";

function RouletteGamePage() {
  const spinResult = useUnit(spinResult$);
  const isBetsClosed = useUnit(betsClosed$);
  const isPaused = false;
  const tableId = useUnit($currentTableId);
  const countdown = useUnit(syncedCountdown$);
  const coins = useUnit($coins);
  const lastResults = useUnit(lastResults$);
  const isStopped = useUnit(isStopped$);
  const initialBets = useUnit($myInitialBets);
  const decrement = useUnit(countdownDecrement);

  const [betAmount, setBetAmount] = useState(0);
  const [bets, setBets] = useState<LocalBet[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [delayedSpinResult, setDelayedSpinResult] = useState<any>(null);
  const [delayedHistory, setDelayedHistory] = useState<any[]>([]);

  useEffect(() => {
    if (tableId) {
      requestGameState(tableId);
      requestWheelState(tableId);
    }
    loadCoins();
  }, [tableId]);

  useEffect(() => {
    if (spinResult) loadCoins();
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
      setDelayedSpinResult(null);
      setStatusMessage("Hagan sus apuestas");
    });
    return () => unsub();
  }, []);

  useEffect(() => resetSpinResult, []);

  useEffect(() => {
    if (bets.length === 0 && initialBets.length > 0) {
      setBets(initialBets);
    }
  }, [initialBets]);

  useEffect(() => {
    if (spinResult) {
      setStatusMessage("La bola está en juego");
      const timeout = setTimeout(() => {
        setDelayedSpinResult(spinResult);
      }, 6000);
      return () => clearTimeout(timeout);
    }
  }, [spinResult]);

  useEffect(() => {
    if (lastResults.length > 0) {
      const timeout = setTimeout(() => {
        setDelayedHistory(lastResults);
      }, 6000);
      return () => clearTimeout(timeout);
    }
  }, [lastResults]);

  useEffect(() => {
    if (isBetsClosed) {
      setStatusMessage("¡No va más!");
    }
  }, [isBetsClosed]);

  useEffect(() => {
    if (delayedSpinResult) {
      setStatusMessage(null);
    }
  }, [delayedSpinResult]);

  const handleIncrement = (amount: number) => {
    setBetAmount((prev) => Math.min(prev + amount, coins));
  };

  const handleReset = () => setBetAmount(0);

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

  const getResultMessage = (spinResult: any) => {
    if (!spinResult?.bets?.length) {
      return {
        message: "No realizaste ninguna apuesta esta ronda.",
        colorClass: "text-red-400",
      };
    }
    const won = spinResult.bets.some((b: any) => b.isWinner === true);
    return won
      ? { message: "¡Ganaste una apuesta! 🎉", colorClass: "text-green-400" }
      : { message: "No acertaste esta vez. 😞", colorClass: "text-red-400" };
  };

  return (
    <div className="min-h-screen bg-green-900 bg-repeat p-6 text-white font-mono">
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
        <div className="flex flex-col items-center">

          {isPaused ? (
            <h2 className="text-3xl font-bold text-red-500 mb-6">
              Ruleta pausada por inactividad
            </h2>
          ) : (
            <>
              <Roulette />

              {statusMessage && (
                <h2 className="text-2xl font-bold mb-2 text-yellow-300 animate-pulse">
                  {statusMessage}
                </h2>
              )}

              {delayedSpinResult && (
                <h2
                  className={`text-xl mb-4 font-bold ${
                    getResultMessage(delayedSpinResult).colorClass
                  }`}
                >
                  {getResultMessage(delayedSpinResult).message}
                </h2>
              )}

              {isStopped && (
                <h2 className="text-3xl font-bold text-red-500 mb-6">
                  Ruleta detenida por inactividad prolongada
                </h2>
              )}

              <CountdownBar countdown={countdown} />

              <BetChipsPanel
                onIncrement={handleIncrement}
                onReset={handleReset}
                betAmount={betAmount}
                coins={coins}
              />

              <RouletteBetBoard
                disabled={isBetsClosed || betAmount <= 0 || betAmount > coins}
                onBet={handleBetClick}
                bets={bets}
              />

              {delayedHistory.length > 0 && (
                <div className="mb-6 text-center">
                  <h3 className="text-xl font-bold mb-2">Últimos resultados:</h3>
                  <RouletteHistory results={delayedHistory} />
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
