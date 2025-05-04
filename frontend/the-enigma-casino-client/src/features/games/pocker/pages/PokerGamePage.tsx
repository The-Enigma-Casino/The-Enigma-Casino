import { useEffect } from "react";
import { useUnit } from "effector-react";

import { CountdownBar } from "../../shared/components/countdownBar/CountdownBar";
import { CardStack } from "../../shared/components/GameCardStack";
import { CardRank, Suit } from "../../shared/types/gameCard.type";
import { ActionControls } from "../components/ActionControls";

import {
  $callAmount,
  $communityCards,
  $currentTurnUserId,
  $isMyTurn,
  $maxRaise,
  $myHand,
  $pokerPhase,
  $pokerPlayers,
  $turnCountdown,
  $validMoves,
  sendPokerAction,
} from "../stores/pokerIndex";
import { RoleChip } from "../components/RoleChip";

export const PokerGamePage = () => {
  const pokerPhase = useUnit($pokerPhase);
  const players = useUnit($pokerPlayers);
  console.log("👥 Renderizando jugadores:", players);
  const communityCards = useUnit($communityCards);
  const currentTurnUserId = useUnit($currentTurnUserId);
  const myHand = useUnit($myHand);
  const turnCountdown = useUnit($turnCountdown);

  const validMoves = useUnit($validMoves);
  const callAmount = useUnit($callAmount);
  const maxRaise = useUnit($maxRaise);

  const isMyTurn = useUnit($isMyTurn);

  const handleAction = (
    move: "fold" | "call" | "check" | "raise" | "all-in",
    amount?: number
  ) => {
    sendPokerAction({ move, amount });
  };

  useEffect(() => {
    // Aquí iría requestGameState o similar si tienes
  }, []);

  console.log("🧪 Render ActionControls con:", {
    validMoves,
    callAmount,
    maxRaise,
    isMyTurn,
  });

  return (
    <div className="min-h-screen bg-green-900 bg-repeat p-6 text-white">
      <h1 className="text-7xl text-center font-bold mb-6 drop-shadow">
        ♣️ Poker
      </h1>

      <p className="text-center mb-4 text-3xl">
        Fase: <span className="font-bold text-green-300">{pokerPhase}</span>
      </p>

      {isMyTurn && <CountdownBar countdown={turnCountdown} total={20} />}

      {/* Cartas comunitarias */}
      <div className="flex justify-center gap-4 mb-8">
        {communityCards.length === 0 ? (
          <p className="text-xl text-white/80">
            Sin cartas comunitarias todavía.
          </p>
        ) : (
          <CardStack
            cards={communityCards.map((card) => ({
              rank: card.rank as CardRank,
              suit: card.suit as Suit,
              value: card.value,
              gameType: "Poker",
            }))}
            hidden={false}
          />
        )}
      </div>

      {/* Tu mano */}
      <div className="flex flex-col items-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Tus cartas</h2>
        {myHand.length > 0 ? (
          <CardStack
            cards={myHand.map((card) => ({
              rank: card.rank as CardRank,
              suit: card.suit as Suit,
              value: card.value,
              gameType: "Poker",
            }))}
            hidden={false}
          />
        ) : (
          <p className="text-white/60">Esperando tus cartas...</p>
        )}
      </div>

      {isMyTurn && (
        <ActionControls
          validMoves={validMoves}
          callAmount={callAmount}
          maxRaise={maxRaise}
          onAction={handleAction}
        />
      )}

      {/* Jugadores visibles */}
      <h2 className="text-2xl font-bold text-center mt-6 mb-4">Jugadores</h2>
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 justify-items-center">
        {players.map((player) => (
          <div
            key={player.id}
            className="relative flex flex-col items-center gap-3 p-4 bg-black/20 rounded-xl shadow-md w-[260px]"
          >
            {player.role && (
              <div className="absolute top-2 left-2">
                <RoleChip role={player.role} />
              </div>
            )}

            <p className="text-xl font-bold">{player.nickname}</p>
            <p className="text-white/70">Fichas: {player.coins}</p>
            <p className="text-white/70">Apuesta actual: {player.currentBet}</p>
            <p className="text-white/70">Apuesta total: {player.totalBet}</p>

            {player.state === "Fold" && (
              <span className="text-red-400 font-semibold">Se ha retirado</span>
            )}
            {player.state === "AllIn" && (
              <span className="text-yellow-300 font-semibold">All-In</span>
            )}
            {player.id === currentTurnUserId && (
              <span className="text-green-300 font-semibold">Turno actual</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
