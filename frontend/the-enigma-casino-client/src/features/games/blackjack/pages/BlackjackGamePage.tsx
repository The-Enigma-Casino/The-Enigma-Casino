import { useState, useEffect } from "react";
import "../store/bjIndex";
import "../store/bjGameStateMapper";
import { useUnit } from "effector-react";
import {
  $players, $croupier, $gameState, $currentTurnUserId, resetPlayers, resetCroupier, resetGameState, resetCroupierTotal, playerHit, playerStand, doubleDown,
  $roundResults, $croupierRoundHand, $croupierTotal, $gamePhase, setGamePhase, $turnCountdown, $countdown
} from "../store/bjIndex";
import { $userId } from "../../../auth/store/authStore";
import { PlayerHUD } from "../../shared/components/PlayerHUD";
import { CardStack } from "../../shared/components/GameCardStack";
import { calculateHandTotal } from "../../shared/utils/gameHand.utils";
import { playerPlaceBet, getGameStateRequested, resetCroupierRoundHand, resetRoundResults, decrementTurnCountdown } from "../store/bjEvents";
import { CardRank, Suit } from "../../shared/types/gameCard.type";
import { ChipStack } from "../../shared/components/ChipStack";
import { loadCoins } from "../../../coins/store/coinsStore";
import { CountdownBar } from "../../shared/components/countdownBar/CountdownBar";
import { GamePlayerCardList } from "../../shared/components/playerCards/GameCardPlayerList";
import { LocalPlayerCard } from "../components/LocalPlayerCard";
export const BlackjackGamePage = () => {


  const players = useUnit($players);
  const croupier = useUnit($croupier);
  const gameState = useUnit($gameState);
  const currentTurnUserId = useUnit($currentTurnUserId);
  // const currentTableId = useUnit($currentTableId);
  const gamePhase = useUnit($gamePhase);


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


  const userId = useUnit($userId);
  const localPlayer = players.find((p) => p.id === Number(userId));

  const [betAmount, setBetAmount] = useState(200);
  const handleHit = () => playerHitFn();
  const handleStand = () => playerStandFn();
  const handleDouble = () => doubleDownFn();
  const isLocalTurn = currentTurnUserId === Number(userId);
  const [showTurnCountdown, setShowTurnCountdown] = useState(false);
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


  const otherPlayers = players
    .filter((p) => p.id !== Number(userId))
    .map((p) => ({
      id: p.id,
      nickName: p.name,
      hand: p.hand,
      total: calculateHandTotal(p.hand),
      bets: p.bet > 0 ? [{ bet: "Blackjack", amount: p.bet }] : [],
      isTurn: p.id === currentTurnUserId,
    }));

  return (
    <div className="min-h-screen bg-green-900 bg-repeat p-6 text-white">
      <div className="max-w-screen-2xl mx-auto flex flex-row gap-6">
        {/* Columna central: contenido principal */}
        <div className="flex-1 flex flex-col items-center">
          <h1 className="text-7xl text-center font-bold mb-6 drop-shadow">
            ♠️ Blackjack
          </h1>

          <p className="text-center mb-4 text-3xl">
            Fase: <span className="font-bold text-green-300">{gamePhase}</span>
          </p>

          {gamePhase === "betting" && <CountdownBar countdown={countdown} total={30} />}
          {gamePhase === "playing" && isLocalTurn && <CountdownBar countdown={turnCountdown} total={20} />}
          {showTurnCountdown && <CountdownBar countdown={turnCountdown} total={20} />}

          {/* Croupier */}
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
                Total: <span className="text-yellow-300">{croupierTotal}</span>
              </p>
            ) : croupier.hand.length === 1 ? (
              <p className="text-xl font-semibold text-white mt-2">
                Total:{" "}
                <span className="text-yellow-300">
                  {croupier.hand[0]?.value ?? "-"}
                </span>
              </p>
            ) : null}
          </div>

          {/* Resultados */}
          {roundResults.length > 0 && (
            <div className="bg-black/70 text-white rounded-lg shadow p-4 my-8 mx-auto max-w-md">
              <h2 className="text-2xl font-bold mb-4 text-center">Resultados de la ronda</h2>
              <ul className="space-y-3">
                {roundResults.map((res) => (
                  <li
                    key={res.userId}
                    className="flex justify-between items-center border-b border-white/10 pb-2"
                  >
                    <span className="font-semibold">{res.nickname}</span>
                    <span>
                      {res.result === "win" && "🟢 Ganó"}
                      {res.result === "lose" && "🔴 Perdió"}
                      {res.result === "draw" && "🟡 Empate"}
                      {res.result === "blackjack" && "🃏 Blackjack!"}
                    </span>
                    <span className="text-3xl text-gray-300">Total: {res.finalTotal}</span>
                    <span className="font-bold text-green-400">
                      {res.coinsChange > 0 ? `+${res.coinsChange}` : `${res.coinsChange}`} fichas
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Apuestas */}
          <h2 className="text-2xl font-bold text-center mt-10 mb-6">
            Jugadores apostando: <span className="text-yellow-300">{players.length}</span>
          </h2>

          {gamePhase === "betting" &&
            (
              players.find((p) => p.id === Number(userId))?.bet === 0 ||
              !players.some((p) => p.id === Number(userId))
            ) && (
              <div className="flex flex-col items-center gap-4 mb-10">
                <p className="text-gray-200 text-center text-xl">
                  Introduce una apuesta para comenzar la partida.
                </p>
                <div className="flex gap-3 justify-center">
                  {[5, 10, 25, 50, 100].map((chip) => (
                    <button
                      key={chip}
                      onClick={() => setBetAmount(betAmount + chip)}
                      className="transform hover:scale-110 transition"
                    >
                      <div
                        className={`w-14 h-14 rounded-full border-4 border-black flex items-center justify-center text-sm font-bold text-white ${{
                            5: "bg-white text-black",
                            10: "bg-lime-400 text-black",
                            25: "bg-orange-500",
                            50: "bg-red-500",
                            100: "bg-purple-500",
                          }[chip]
                          }`}
                      >
                        {chip}
                      </div>
                    </button>
                  ))}
                  <button
                    onClick={() => setBetAmount(0)}
                    className="text-sm text-red-300 hover:underline ml-2"
                  >
                    Reset
                  </button>
                </div>
                <p className="text-lg">
                  Apuesta actual:{" "}
                  <span className="font-extrabold text-green-300">${betAmount}</span>
                </p>
                <button
                  onClick={() => playerPlaceBet(betAmount)}
                  disabled={betAmount < 50 || betAmount > 5000}
                  className="px-6 py-2 rounded bg-indigo-600 hover:bg-indigo-700 font-bold text-white disabled:opacity-50"
                >
                  Apostar
                </button>
              </div>
            )}

          {/* Jugador local */}
          {localPlayer && (
            <div className="w-full flex justify-center my-8">
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
            </div>
          )}
        </div>

        {/* Lista de jugadores en la mesa */}
        <div className="w-[300px]">
          <GamePlayerCardList
            players={otherPlayers}
            coins={betAmount}
            gameType="Blackjack"
          />
        </div>
      </div>
    </div>
  );
};
