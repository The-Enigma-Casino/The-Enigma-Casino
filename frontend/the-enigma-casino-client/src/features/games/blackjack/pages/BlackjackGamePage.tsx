import { useUnit } from "effector-react";
import {
  $players,
  $croupier,
  $gameState,
  resetPlayers,
  resetCroupier,
  resetGameState,
  setGameState,
  playerHit,
  playerStand,
  doubleDown,
} from "../store/bjIndex";
import { PlayerHUD } from "../../shared/components/PlayerHUD";
import { CardStack } from "../../shared/components/GameCardStack";
import { calculateHandTotal } from "../../shared/utils/gameHand.utils";

export const BlackjackGamePage = () => {
  const [
    players,
    croupier,
    gameState,
    resetPlayersFn,
    resetCroupierFn,
    resetGameStateFn,
    setGameStateFn,
    playerHitFn,
    playerStandFn,
    doubleDownFn,
  ] = useUnit([
    $players,
    $croupier,
    $gameState,
    resetPlayers,
    resetCroupier,
    resetGameState,
    setGameState,
    playerHit,
    playerStand,
    doubleDown,
  ]);

  const handleHit = (playerId: number) => {
    playerHitFn(playerId);
  };

  const handleStand = (playerId: number) => {
    playerStandFn(playerId);
  };

  const handleDouble = (playerId: number) => {
    doubleDownFn(playerId);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Blackjack</h1>
      <p className="mb-4">
        Estado del juego: <strong>{gameState}</strong>
      </p>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setGameStateFn("InProgress")}
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          Empezar
        </button>
        <button
          onClick={() => setGameStateFn("Finished")}
          className="px-4 py-2 bg-red-500 text-white rounded"
        >
          Terminar
        </button>
        <button
          onClick={() => {
            resetPlayersFn();
            resetCroupierFn();
            resetGameStateFn();
          }}
          className="px-4 py-2 bg-gray-300 rounded"
        >
          Reiniciar partida
        </button>
      </div>

      <h2 className="text-xl font-semibold mb-2">Croupier</h2>
      <CardStack
        cards={croupier.hand}
        hidden={gameState === "InProgress"}
        total={calculateHandTotal(
          gameState === "InProgress" ? croupier.hand.slice(1) : croupier.hand
        )}
      />

      <h2 className="text-xl font-semibold mb-2">Jugadores</h2>
      <div className="flex gap-8 flex-wrap justify-center mt-4">
        {players.map((player) => (
          <div key={player.id} className="flex flex-col items-center">
            <PlayerHUD
              name={player.name}
              coins={player.bet}
              avatarUrl={`https://i.pravatar.cc/300?u=${player.id}`}
              isCurrent={player.id === 1}
            />
            <CardStack
              cards={player.hand}
              total={calculateHandTotal(player.hand)}
            />

            {/* Solo mostrar botones si el jugador está en el estado "Playing" */}
            {player.state === "Playing" && (
              <div className="flex gap-4 mt-4">
                <button
                  onClick={() => handleHit(player.id)}
                  className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                  Hit
                </button>
                <button
                  onClick={() => handleStand(player.id)}
                  className="px-4 py-2 bg-yellow-500 text-white rounded"
                >
                  Stand
                </button>
                <button
                  onClick={() => handleDouble(player.id)}
                  className="px-4 py-2 bg-purple-500 text-white rounded"
                >
                  Double
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};