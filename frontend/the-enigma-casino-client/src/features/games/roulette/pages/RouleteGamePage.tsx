import { useEffect, useState } from "react";
import { useUnit } from "effector-react";

import { $currentTableId } from "../../../gameTables/store/tablesStores";
import { $coins, loadCoins } from "../../../coins/store/coinsStore";

import { RouletteBetBoard } from "../components/RouletteBetBoard";
import { RouletteHistory } from "../components/RouletteHistory";
import { CountdownBar } from "../../shared/components/countdownBar/CountdownBar";
import { RoulettePlayersPanel } from "../components/RoulettePlayersPanel";
import { LocalBet } from "../types/localBet.type";
import { buildBetPayload } from "../utils/buildBetPayload";
import Roulette from "../components/RouletteWheel";
import { BetChipsPanel } from "../../shared/components/betChipsPanel/BetChipsPanel";

import styles from "./RouleteGamePage.module.css";
import {
  $myInitialBets,
  betsClosed$,
  betsOpenedReceived,
  countdownDecrement,
  isStopped$,
  lastResults$,
  placeRouletteBet,
  requestGameState,
  requestWheelState,
  resetSpinResult,
  roulettePlayers$,
  spinResult$,
  syncedCountdown$,
} from "../stores";

function RouletteGamePage() {
  const spinResult = useUnit(spinResult$);
  const isBetsClosed = useUnit(betsClosed$);
  const tableId = useUnit($currentTableId);
  const countdown = useUnit(syncedCountdown$);
  const coins = useUnit($coins);
  const lastResults = useUnit(lastResults$);
  const isStopped = useUnit(isStopped$);
  const initialBets = useUnit($myInitialBets);
  const decrement = useUnit(countdownDecrement);
  const players = useUnit(roulettePlayers$);

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
    resetSpinResult();
  }, [tableId]);

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
      setDelayedHistory([]);
      setStatusMessage("Hagan sus apuestas");
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (bets.length === 0 && initialBets.length > 0) {
      setBets(initialBets);
    }
  }, [initialBets]);

  useEffect(() => {
    if (!spinResult) return;

    setStatusMessage("La bola está en juego");

    const timeout = setTimeout(() => {
      setDelayedSpinResult(spinResult);
      setDelayedHistory(lastResults);
      loadCoins();
      setStatusMessage(null);
    }, 6000);

    return () => clearTimeout(timeout);
  }, [spinResult, lastResults]);

  useEffect(() => {
    if (isBetsClosed) {
      setStatusMessage("¡No va más!");
    }
  }, [isBetsClosed]);

  const handleIncrement = (amount: number) => {
    setBetAmount((prev) => Math.min(prev + amount, coins));
  };

  const handleReset = () => setBetAmount(0);

  const handleBetClick = (bet: string | number) => {
    if (isBetsClosed || betAmount <= 0 || betAmount > coins || !tableId) return;

    const key = typeof bet === "number" ? `number_${bet}` : bet;
    const label = typeof bet === "number" ? `${bet}` : bet.toUpperCase();

    setBets((prev) => {
      const existing = prev.find((b) => b.key === key);
      if (existing) {
        return prev.map((b) =>
          b.key === key ? { ...b, amount: b.amount + betAmount } : b
        );
      } else {
        return [...prev, { key, label, amount: betAmount }];
      }
    });

    const payload = buildBetPayload(tableId.toString(), key, betAmount);
    if (payload) placeRouletteBet(payload);

    loadCoins();
  };

  const handleRemoveBet = (bet: string | number) => {
    if (!tableId) return;

    const key = typeof bet === "number" ? `number_${bet}` : bet;
    const existing = bets.find((b) => b.key === key);
    if (!existing) return;

    const payload = buildBetPayload(tableId.toString(), key, -existing.amount);
    if (payload) placeRouletteBet(payload);

    setBets((prev) => prev.filter((b) => b.key !== key));
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
    const totalWon = spinResult.totalWon ?? 0;
    return won
      ? {
          message: `¡Ganaste ${totalWon} fichas! 🎉`,
          colorClass: "text-green-400",
        }
      : { message: "No acertaste esta vez. 😞", colorClass: "text-red-400" };
  };

  return (
    <div className="min-h-screen bg-green-900 bg-repeat p-6 text-white font-mono flex flex-col gap-6">
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_1.2fr] gap-8 flex-grow">
        <div className="flex flex-col items-center gap-6">
          <Roulette />

          {statusMessage && (
            <h2 className="text-2xl font-bold text-yellow-300 animate-pulse">
              {statusMessage}
            </h2>
          )}

          {delayedSpinResult && (
            <h2
              className={`text-xl font-bold ${
                getResultMessage(delayedSpinResult).colorClass
              }`}
            >
              {getResultMessage(delayedSpinResult).message}
            </h2>
          )}

          {isStopped && (
            <h2 className="text-3xl font-bold text-red-500">
              Ruleta detenida por inactividad
            </h2>
          )}

          <CountdownBar countdown={countdown} />

          {delayedHistory.length > 0 && (
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2">Últimos resultados:</h3>
              <RouletteHistory results={delayedHistory} />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6 h-full overflow-hidden">
          <div className="w-full overflow-auto">
            <div className="min-w-max flex justify-center">
              <div className={styles.rouletteScaleWrapper}>
                <RouletteBetBoard
                  disabled={isBetsClosed || betAmount <= 0 || betAmount > coins}
                  onBet={handleBetClick}
                  onRemove={handleRemoveBet}
                  bets={bets}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <BetChipsPanel
              onIncrement={handleIncrement}
              onReset={handleReset}
              betAmount={betAmount}
              coins={coins}
            />
          </div>
        </div>
      </div>

      {players.length > 1 && (
        <div className="w-full overflow-x-auto py-4 px-2">
          <div className="flex gap-4 min-w-fit">
            <RoulettePlayersPanel />
          </div>
        </div>
      )}
    </div>
  );
}

export default RouletteGamePage;
