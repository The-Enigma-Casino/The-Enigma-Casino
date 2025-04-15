import { useState, useEffect } from "react";
import "../store/bjIndex";
import "../store/bjGameStateMapper";
import { useUnit } from "effector-react";
import {
  $players,
  $croupier,
  $gameState,
  $currentTurnUserId,
  resetPlayers,
  resetCroupier,
  resetGameState,
  playerHit,
  playerStand,
  doubleDown,
  $roundResults,
  $croupierRoundHand,
  $croupierTotal,
} from "../store/bjIndex";
import { $userId } from "../../../auth/store/authStore";
import { PlayerHUD } from "../../shared/components/PlayerHUD";
import { CardStack } from "../../shared/components/GameCardStack";
import { calculateHandTotal } from "../../shared/utils/gameHand.utils";
import { playerPlaceBet, getGameStateRequested, resetCroupierRoundHand } from "../store/bjEvents";
import { $currentTableId } from "../../../gameTables/store/tablesStores";
import { CardRank, GameType, Suit } from "../../shared/types/gameCard.type";
import { GameCard } from "../../shared/interfaces/gameCard.interface";
export const BlackjackGamePage = () => {
  const [
    players,
    croupier,
    gameState,
    currentTurnUserId,
    croupierTotal,
    resetPlayersFn,
    resetCroupierFn,
    resetGameStateFn,
    playerHitFn,
    playerStandFn,
    doubleDownFn,
    roundResults,
    croupierRoundHand,
  ] = useUnit([
    $players,
    $croupier,
    $gameState,
    $currentTurnUserId,
    $currentTableId,
    resetPlayers,
    resetCroupier,
    resetGameState,
    playerHit,
    playerStand,
    doubleDown,
    $roundResults,
    $croupierRoundHand,
    $croupierTotal,
  ]);

  function getCroupierCardsToShow({
    gameState,
    croupier,
    roundResults,
    croupierRoundHand,
  }: {
    gameState: string;
    croupier: { hand: GameCard[] };
    roundResults: any[];
    croupierRoundHand: { rank: string; suit: string; value: number }[];
  }): GameCard[] {
    const asGameCard = (card: any): GameCard => ({
      ...card,
      gameType: "BlackJack",
    });

    // Si ya terminó la ronda, mostramos la mano final del crupier
    if (roundResults.length > 0) {
      return croupierRoundHand.map(asGameCard);
    }

    // Si hay una sola carta, agregamos una oculta
    if (gameState === "InProgress" && croupier.hand.length === 1) {
      return [
        asGameCard(croupier.hand[0]),
        {
          rank: "Hidden" as CardRank,
          suit: "Spades", // suit dummy válido
          value: 0,
          gameType: "BlackJack",
        },
      ];
    }

    // Si tiene más de una carta visible
    return croupier.hand.map(asGameCard);
  }
  const userId = useUnit($userId);

  const [betAmount, setBetAmount] = useState(200);

  useEffect(() => {
    getGameStateRequested();
  }, []);

  useEffect(() => {
    const allWaiting = players.every(
      (p) => p.state === "Waiting" && p.hand.length === 0 && p.bet === 0
    );

    if (allWaiting && gameState === "InProgress" && roundResults.length > 0) {
      console.log("Reiniciando estado del frontend para nueva ronda...");
      resetPlayersFn();
      resetPlayers();
      resetCroupier();
      resetGameState();
    }
  }, [
    players,
    gameState,
    roundResults.length,
    resetPlayersFn,
    resetCroupierFn,
    resetGameStateFn,
  ]);

  useEffect(() => {
    if (gameState === "Waiting") {
      console.log("Limpiando estado para nueva ronda...");
      resetCroupierRoundHand();
      resetPlayersFn();
      resetCroupierFn();
      resetGameStateFn();
    }
  }, [gameState]);

  console.log("Croupier para mostrar:", croupier.hand);


  useEffect(() => {
    const localPlayer = players.find(p => p.id === Number(userId));
    const isTurn = currentTurnUserId === Number(userId);
    console.log("Debug Turno →", {
      userId,
      currentTurnUserId,
      isTurn,
      localPlayer,
      estado: localPlayer?.state,
      gameState,
    });
  }, [players, currentTurnUserId, userId, gameState]);

  const handleHit = () => playerHitFn();
  const handleStand = () => playerStandFn();
  const handleDouble = () => doubleDownFn();
  console.log("GAME STATE", gameState)

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Blackjack</h1>

      <p className="mb-4">
        Estado del juego: <strong>{gameState}</strong>
      </p>

      {roundResults.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <h2 className="text-xl font-semibold mb-2 text-center">🎉 Resultados de la ronda</h2>
          <ul className="space-y-2">
            {roundResults.map((res) => (
              <li key={res.userId} className="flex justify-between items-center border-b pb-1">
                <span className="font-medium">{res.nickname}</span>
                <span>
                  {res.result === "win" && "🟢 Ganó"}
                  {res.result === "lose" && "🔴 Perdió"}
                  {res.result === "draw" && "🟡 Empate"}
                  {res.result === "blackjack" && "🃏 Blackjack!"}
                </span>
                <span className="text-sm text-gray-500">Total: {res.finalTotal}</span>
                <span className="font-semibold">
                  {res.coinsChange > 0 ? `+${res.coinsChange} ` : `${res.coinsChange}`}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {gameState === "Waiting" && (
        <div className="flex flex-col items-center gap-4 mb-6">
          <p className="text-gray-500">Introduce una apuesta para comenzar la partida.</p>
          <div className="flex gap-2 items-center">
            <input
              type="number"
              min={50}
              max={5000}
              value={betAmount}
              onChange={(e) => setBetAmount(Number(e.target.value))}
              className="px-2 py-1 border rounded w-24"
            />
            <button
              onClick={() => playerPlaceBet(betAmount)}
              disabled={betAmount < 50 || betAmount > 5000}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 transition"
            >
              Apostar
            </button>
          </div>
          {betAmount > 0 && (betAmount < 50 || betAmount > 5000) && (
            <span className="text-sm text-red-500">
              La apuesta debe ser entre 50 y 5000
            </span>
          )}
        </div>
      )}

      <h2 className="text-xl font-semibold mb-2">Croupier</h2>

      {/* Mostrar cartas del crupier al final de la ronda */}
      {roundResults.length > 0 && (
        <CardStack
          cards={croupierRoundHand.map((card) => ({
            rank: card.rank as CardRank,
            suit: card.suit as Suit,
            value: card.value,
            gameType: "BlackJack",
          }))}
          total={croupierTotal ?? undefined}
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
          total={croupierTotal ?? undefined}
          hidden={true}
        />
      )}

      <h2 className="text-xl font-semibold mb-2">Jugadores</h2>
      <div className="flex gap-8 flex-wrap justify-center mt-4">
        {players.map((player) => {
          const isTurn = player.id === currentTurnUserId;
          const isLocalPlayer = player.id === Number(userId);
          console.log("PLAYER", player)
          console.log("ISTURN", isTurn);
          console.log("islocalplaye5r", isLocalPlayer);
          return (
            <div key={player.id} className="flex flex-col items-center">
              <PlayerHUD
                name={player.name}
                coins={player.bet}
                avatarUrl={`https://i.pravatar.cc/300?u=${player.id}`}
                isCurrent={isTurn}
              />

              <CardStack
                cards={player.hand}
                total={calculateHandTotal(player.hand)}
              />

              {isLocalPlayer && player.state === "Waiting" && player.bet === 0 && (
                <div className="flex flex-col items-center gap-2 mt-4">
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      min={50}
                      max={5000}
                      value={betAmount}
                      onChange={(e) => setBetAmount(Number(e.target.value))}
                      className="px-2 py-1 border rounded w-24"
                    />
                    <button
                      onClick={() => playerPlaceBet(betAmount)}
                      disabled={betAmount < 50 || betAmount > 5000}
                      className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 transition"
                    >
                      Apostar
                    </button>
                  </div>
                  {betAmount > 0 && (betAmount < 50 || betAmount > 5000) && (
                    <span className="text-sm text-red-500">
                      La apuesta debe ser entre 50 y 5000
                    </span>
                  )}
                </div>
              )}


              {gameState === "InProgress" && isLocalPlayer && isTurn && player.state === "Playing" && (
                <div className="flex gap-4 mt-4">
                  <button onClick={handleHit} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                    Hit
                  </button>
                  <button onClick={handleStand} className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600">
                    Stand
                  </button>
                  <button onClick={handleDouble} className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600">
                    Double
                  </button>
                </div>
              )}

              {isLocalPlayer && gameState === "InProgress" && player.state !== "Playing" && (
                <p className="mt-2 italic text-gray-500">
                  {player.state === "Bust" && "¡Te pasaste de 21!"}
                  {player.state === "Stand" && "Te has plantado. Esperando siguiente jugador..."}
                  {player.state === "Lose" && "Has perdido esta ronda. Esperando resultado final..."}
                  {player.state === "Win" && "¡Has ganado esta ronda!"}
                </p>
              )}


            </div>
          );
        })}
      </div>
    </div>
  );
};
