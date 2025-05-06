import { useState, useEffect } from "react";
import "../store/bjIndex";
import "../store/bjGameStateMapper";
import { useUnit } from "effector-react";
import {
  $players, $croupier, $gameState, $currentTurnUserId, resetPlayers, resetCroupier, resetGameState, resetCroupierTotal, playerHit, playerStand, doubleDown,
  $roundResults, $croupierRoundHand, $croupierTotal, $gamePhase, setGamePhase, $turnCountdown, $countdown,
  $persistedBets
} from "../store/bjIndex";
import { $userId } from "../../../auth/store/authStore";
import { CardStack } from "../../shared/components/GameCardStack";
import { calculateHandTotal } from "../../shared/utils/gameHand.utils";
import { playerPlaceBet, getGameStateRequested, resetCroupierRoundHand, resetRoundResults, decrementTurnCountdown, localBetPlaced } from "../store/bjEvents";
import { CardRank, Suit } from "../../shared/types/gameCard.type";
import { $coins, loadCoins } from "../../../coins/store/coinsStore";
import { CountdownBar } from "../../shared/components/countdownBar/CountdownBar";
import { GamePlayerCardList } from "../../shared/components/playerCards/GameCardPlayerList";
import { LocalPlayerCard } from "../components/LocalPlayerCard";
import { BetChipsPanel } from "../../shared/components/betChipsPanel/BetChipsPanel";
import { ActionButton } from "../../shared/components/buttonActions/ActionButton";
export const BlackjackGamePage = () => {

  const gamePhaseLabels: Record<string, string> = {
    betting: "Apuestas abiertas",
    playing: "Ronda en curso",
    results: "Resultados",
  };

  const players = useUnit($players);
  const croupier = useUnit($croupier);
  const gameState = useUnit($gameState);
  const currentTurnUserId = useUnit($currentTurnUserId);
  // const currentTableId = useUnit($currentTableId);
  const gamePhase = useUnit($gamePhase);
  const totalCoinsUser = useUnit($coins);

  const roundResults = useUnit($roundResults);
  const croupierRoundHand = useUnit($croupierRoundHand);
  const croupierTotal = useUnit($croupierTotal);

  const resetPlayersFn = useUnit(resetPlayers);
  const resetCroupierFn = useUnit(resetCroupier);
  const resetGameStateFn = useUnit(resetGameState);
  const resetCroupierTotalFn = useUnit(resetCroupierTotal);
  // const resetRoundResultsFn = useUnit(resetRoundResults); // Reinicia marcador

  const playerHitFn = useUnit(playerHit);
  const playerStandFn = useUnit(playerStand);
  const doubleDownFn = useUnit(doubleDown);
  const countdown = useUnit($countdown);
  const turnCountdown = useUnit($turnCountdown);
  const persistedBets = useUnit($persistedBets);

  const userId = useUnit($userId);
  const localPlayer = players.find((p) => p.id === Number(userId));

  const [betAmount, setBetAmount] = useState(200);
  const handleHit = () => playerHitFn();
  const handleStand = () => playerStandFn();
  const handleDouble = () => {
    doubleDown();
    setBetAmount((prev) => prev * 2);
  };
  const isLocalTurn = currentTurnUserId === Number(userId);
  const [showTurnCountdown, setShowTurnCountdown] = useState(false);
  const [betSubmitted, setBetSubmitted] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const currentPhaseLabel = gamePhaseLabels[gamePhase] ?? gamePhase;
  const [showShuffling, setShowShuffling] = useState(false);

  useEffect(() => {
    getGameStateRequested();
    loadCoins();
  }, [gamePhase]);

  useEffect(() => {
    if (gamePhase === "betting") {
      resetPlayersFn();
      resetCroupierFn();
      resetGameStateFn();
      resetCroupierTotalFn();
      resetCroupierRoundHand();
      resetRoundResults();
      loadCoins();
      setBetAmount(0);
      setBetSubmitted(false);
      setShowConfirmation(false);
    } else {
      loadCoins();
    }
  }, [gamePhase]);

  useEffect(() => {
    if (gamePhase === "playing" && isLocalTurn && turnCountdown === 20) {
      const fallback = setInterval(() => {
        decrementTurnCountdown();
      }, 1000);

      return () => clearInterval(fallback);
    }
  }, [gamePhase, isLocalTurn, turnCountdown]);

  useEffect(() => {
    if (gamePhase === "results") {
      const delay = setTimeout(() => {
        setShowShuffling(true);
      }, 3000);

      return () => clearTimeout(delay);
    } else {
      setShowShuffling(false);
    }
  }, [gamePhase]);


  const otherPlayers = players
  .filter((p) => p.id !== Number(userId))
  .map((p) => {
    const bet = p.bet > 0 ? p.bet : persistedBets[p.id] ?? 0;
    return {
      id: p.id,
      nickName: p.name,
      hand: p.hand,
      total: calculateHandTotal(p.hand),
      bets: bet > 0 ? [{ bet: "Blackjack", amount: bet }] : [],
      isTurn: p.id === currentTurnUserId,
      coins: bet,
    };
  });


  const handlePlaceBet = () => {
    playerPlaceBet(betAmount);
    localBetPlaced(betAmount);    
    setBetSubmitted(true);
    setShowConfirmation(true);
  };


  return (
    <div className="min-h-screen bg-green-900 bg-repeat p-6 text-white">
      <div className="max-w-screen-2xl mx-auto flex flex-row gap-6 items-start">
        {/* Columna central: contenido principal */}
        <div className="flex-1 flex flex-col items-center">
          <h1 className="text-7xl text-center font-bold mb-6 drop-shadow">
            ♠️ Blackjack
          </h1>

          <p className="text-center mb-4 text-3xl">
            <span className="font-bold text-green-300">{currentPhaseLabel}</span>
          </p>

          {gamePhase === "betting" && <CountdownBar countdown={countdown} total={30} />}
          {gamePhase === "playing" && isLocalTurn && <CountdownBar countdown={turnCountdown} total={20} />}
          {showTurnCountdown && <CountdownBar countdown={turnCountdown} total={20} />}

          {/* Croupier */}
          {(roundResults.length > 0 || (gameState === "InProgress" && croupier.hand.length === 1)) && (
            <>
              <h2 className="text-2xl font-bold text-center mt-6 mb-2">Croupier</h2>
              <div className="flex justify-center items-center flex-col gap-2">
                {roundResults.length > 0 && (
                  <CardStack
                    cards={croupierRoundHand.map((card) => ({
                      rank: card.rank as CardRank,
                      suit: card.suit as Suit,
                      value: card.value,
                      gameType: "BlackJack",
                    }))}
                    hidden={false}
                  />
                )}

                {gameState === "InProgress" && croupier.hand.length === 1 && (
                  <CardStack
                    cards={[
                      {
                        rank: "Ace",
                        suit: "Spades",
                        value: 0,
                        gameType: "BlackJack",
                      },
                      {
                        ...croupier.hand[0],
                        gameType: "BlackJack",
                      },
                    ]}
                    hidden={true}
                  />
                )}

                {roundResults.length > 0 && croupierTotal > 0 ? (
                  <p className="text-xl font-bold text-white mt-2">
                    Total: <span className="text-Coins">{croupierTotal}</span>
                  </p>
                ) : croupier.hand.length === 1 ? (
                  <p className="text-xl font-semibold text-white mt-2">
                    Total: <span className="text-Coins">{croupier.hand[0]?.value ?? "-"}</span>
                  </p>
                ) : null}

                {showShuffling && (
                  <div className="mt-4 text-3xl text-Coins font-bold animate-pulse">
                    🃏 Barajando cartas para la próxima ronda...
                  </div>
                )}
              </div>
            </>
          )}

          {/* Apuestas */}
          {players.length > 0 && (
            <h2 className="text-2xl font-bold text-center mt-10 mb-6">
              Jugadores apostando: <span className="text-Coins">{players.length}</span>
            </h2>

          )}

          {gamePhase === "betting" && (
            <>
              {!betSubmitted ? (
                <div className="flex flex-col items-center">
                  <BetChipsPanel
                    onIncrement={(val) => setBetAmount((prev) => prev + val)}
                    onReset={() => setBetAmount(0)}
                    betAmount={betAmount}
                    coins={totalCoinsUser}
                  />

                  <ActionButton
                    onClick={handlePlaceBet}
                    disabled={betAmount < 50 || betAmount > 5000}
                    label="Apostar"
                    color="purple"
                    className="w-full max-w-[150px] text-xl py-4"
                  />
                </div>
              ) : (
                showConfirmation && !localPlayer && players.length >= 0 && (
                  <div className="text-center mt-4 bg-green-700 px-6 py-3 rounded-lg shadow-md text-2xl font-bold text-white">
                    ¡Apuesta realizada correctamente! Esperando a los demás jugadores...
                  </div>
                )
              )}
            </>
          )}

          {/* Jugador local */}
          {localPlayer && (
            <LocalPlayerCard
              player={{
                id: localPlayer.id,
                nickName: localPlayer.name,
                hand: localPlayer.hand,
                total: calculateHandTotal(localPlayer.hand),
                bets: localPlayer.bet > 0 ? [{ bet: "Blackjack", amount: localPlayer.bet }] : [],
                isTurn: localPlayer.id === currentTurnUserId,
                coins: betAmount,
                state: localPlayer.state,
              }}
              gameType="Blackjack"
              gameState={gameState}
              onHit={handleHit}
              onStand={handleStand}
              onDouble={handleDouble}
            />
          )}
        </div>

        {/* Lista de jugadores en la mesa */}
        <GamePlayerCardList
          players={otherPlayers}
          gameType="Blackjack"
        />
      </div>
    </div>
  );
};
