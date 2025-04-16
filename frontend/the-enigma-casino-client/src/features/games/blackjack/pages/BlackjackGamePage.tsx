import { useState, useEffect } from "react";
import "../store/bjIndex";
import "../store/bjGameStateMapper";
import { useUnit } from "effector-react";
import {
  $players, $croupier, $gameState, $currentTurnUserId, resetPlayers, resetCroupier, resetGameState, resetCroupierTotal, playerHit, playerStand, doubleDown,
  $roundResults, $croupierRoundHand, $croupierTotal
} from "../store/bjIndex";
import { $userId } from "../../../auth/store/authStore";
import { PlayerHUD } from "../../shared/components/PlayerHUD";
import { CardStack } from "../../shared/components/GameCardStack";
import { calculateHandTotal } from "../../shared/utils/gameHand.utils";
import { playerPlaceBet, getGameStateRequested, resetCroupierRoundHand, resetRoundResults } from "../store/bjEvents";
import { CardRank, Suit } from "../../shared/types/gameCard.type";
import { ChipStack } from "../../shared/components/ChipStack";
import { loadCoins } from "../../../coins/store/coinsStore";
export const BlackjackGamePage = () => {


  const players = useUnit($players);
  const croupier = useUnit($croupier);
  const gameState = useUnit($gameState);
  const currentTurnUserId = useUnit($currentTurnUserId);
  // const currentTableId = useUnit($currentTableId);

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

  const userId = useUnit($userId);

  const [betAmount, setBetAmount] = useState(200);
  const handleHit = () => playerHitFn();
  const handleStand = () => playerStandFn();
  const handleDouble = () => doubleDownFn();

  useEffect(() => {
    getGameStateRequested();
    loadCoins();
  }, []);

  useEffect(() => {
    const allWaiting = players.every(
      (p) => p.state === "Waiting" && p.hand.length === 0 && p.bet === 0
    );

    if (allWaiting && gameState === "InProgress" && roundResults.length > 0) {
      resetCroupierRoundHand();
      resetPlayersFn();
      resetCroupierFn();
      resetGameStateFn();
      resetCroupierTotalFn();
      resetCroupierTotal();
    }
    loadCoins();
  }, [players, gameState, roundResults]);

  return (
    <div className="min-h-screen bg-green-900 bg-repeat p-6 text-white font-mono">
      <h1 className="text-7xl text-center font-bold mb-6 drop-shadow">♠️ Blackjack</h1>

      <p className="text-center mb-4 text-3xl">
        Estado del juego: <span className="font-bold text-yellow-300">{gameState}</span>
      </p>

      {/* Marcador jugadas */}
      {roundResults.length > 0 && (
        <div className="bg-black/70 text-white rounded-lg shadow p-4 mb-8 mx-auto max-w-md ">
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
                  {res.coinsChange > 0 ? `+${res.coinsChange} ` : `${res.coinsChange} fichas`} {/* coinsChangue falla del back */}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Croupier */}
      <h2 className="text-2xl font-bold text-center mt-6 mb-2">Croupier</h2>

      <div className="flex justify-center items-center flex-col gap-2">
        {/* Mostrar cartas del crupier al final de la ronda */}
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

      {/* Jugadores */}
      <h2 className="text-2xl font-bold text-center mt-10 mb-6">
        Jugadores apostando: <span className="text-yellow-300">{players.length}</span>
      </h2>

      {gameState === "Waiting" &&
        (
          players.find((p) => p.id === Number(userId))?.bet === 0 ||
          !players.some((p) => p.id === Number(userId))
        ) && (

          <div className="flex flex-col items-center gap-4 mb-10">
            <p className="text-gray-200 text-center text-xl">Introduce una apuesta para comenzar la partida.</p>

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
                    }[chip]}`}
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

      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 justify-items-center">
        {players.map((player) => {
          const isTurn = player.id === currentTurnUserId;
          const isLocalPlayer = player.id === Number(userId);
          const totalHand = calculateHandTotal(player.hand);

          return (
            <div
              key={player.id}
              className="flex flex-col items-center gap-3 p-4 bg-black/20 rounded-xl shadow-md w-[260px]"
            >
              <CardStack cards={player.hand} />

              <p className="text-xl text-white font-bold -mt-2">
                Total: <span className="text-yellow-300">{totalHand}</span>
              </p>
              {(isTurn && croupier.hand.length === 1 &&
                <span className="text-xl">{`Es el turno de: ${player.name}`}</span>
              )}

              <div className="flex items-end gap-3">
                <PlayerHUD
                  name={player.name}
                  coins={betAmount}
                  avatarUrl={`https://i.pravatar.cc/300?u=${player.id}`}
                  isCurrent={isTurn}
                />

                {player.bet > 0 && (
                  <div className="flex flex-col items-center">
                    <ChipStack coins={betAmount} />
                    <span className="text-xs font-bold text-white mt-1">${player.bet}</span>
                  </div>
                )}
              </div>

              {/* Botones de acción */}
              {isLocalPlayer && gameState === "InProgress" && isTurn && player.state === "Playing" && (
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={handleHit}
                    className="px-4 py-2 bg-green-500 border-2 border-black text-black font-bold rounded hover:bg-green-600 shadow"
                  >
                    HIT
                  </button>
                  <button
                    onClick={handleStand}
                    className="px-4 py-2 bg-yellow-300 border-2 border-black text-black font-bold rounded hover:bg-yellow-400 shadow"
                  >
                    STAND
                  </button>
                  <button
                    onClick={handleDouble}
                    className="px-4 py-2 bg-purple-600 border-2 border-black text-white font-bold rounded hover:bg-purple-700 shadow"
                  >
                    DOUBLE
                  </button>
                </div>
              )}

              {/* Estado del jugador */}
              {isLocalPlayer && gameState === "InProgress" && player.state !== "Playing" && (
                <p className="text-sm italic text-white/70 mt-2">
                  {player.state === "Bust" && "💥 Te pasaste de 21!"}
                  {player.state === "Stand" && "🧍 Te plantaste. Esperando..."}
                  {player.state === "Lose" && "❌ Has perdido esta ronda."}
                  {player.state === "Win" && "🏆 ¡Victoria!"}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
