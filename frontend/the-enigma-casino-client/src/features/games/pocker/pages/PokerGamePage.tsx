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
  $opponentLeft,
  $pokerPhase,
  $pokerPlayers,
  $roundSummary,
  $turnCountdown,
  $turnCountdownTotal,
  $validMoves,
  decrementTurnCountdown,
  sendPokerAction,
} from "../stores/pokerIndex";
import { $userId } from "../../../auth/store/authStore";
import { GamePlayerCardList } from "../../shared/components/playerCards/GameCardPlayerList";
import { PlayerPokerCard } from "../components/PlayerPokerCard";
import { $playerAvatars } from "../../stores/gamesStore";
import { getPlayerAvatarsFx } from "../../actions/playerAvatarsAction";
import { RoundResult } from "../components/RoundResult";

export const PokerGamePage = () => {
  const pokerPhase = useUnit($pokerPhase);

  const players = useUnit($pokerPlayers);
  const userId = useUnit($userId);

  const me = players.find((p) => String(p.id) === userId);
  const otherPlayers = players.filter((p) => p.id !== Number(userId));

  const avatars = useUnit($playerAvatars);
  const otherPlayersWithAvatar = otherPlayers.filter((p) =>
    avatars.some((a) => a.nickName === p.nickname)
  );

  const communityCards = useUnit($communityCards);
  const currentTurnUserId = useUnit($currentTurnUserId);

  const hand = useUnit($myHand);

  const countdown = useUnit($turnCountdown);
  const total = useUnit($turnCountdownTotal);
  const decrement = useUnit(decrementTurnCountdown);

  const validMoves = useUnit($validMoves);
  const callAmount = useUnit($callAmount);
  const maxRaise = useUnit($maxRaise);

  const isMyTurn = useUnit($isMyTurn);

  const roundSummary = useUnit($roundSummary);

  const opponentLeft = useUnit($opponentLeft);

  const handleAction = (
    move: "fold" | "call" | "check" | "raise" | "all-in",
    amount?: number
  ) => {
    sendPokerAction({ move, amount });
  };

  useEffect(() => {
    if (players.length > 0) {
      const nicknames = players.map((p) => p.nickname);
      getPlayerAvatarsFx(nicknames);
    }
  }, [players]);

  useEffect(() => {
    const interval = setInterval(() => {
      decrement();
    }, 1000);
    return () => clearInterval(interval);
  }, [decrement]);

  //BORRAR
  // console.log("🧠 Render PokerGamePage");
  // console.log(" - userId:", userId);
  console.log(" - currentTurnUserId:", currentTurnUserId);
  console.log(" - isMyTurn:", isMyTurn);
  // console.log(" - validMoves:", validMoves);
  // console.log(" - opponentLeft:", opponentLeft);

  return (
    <div className="min-h-screen bg-green-900 bg-repeat p-6 text-white">
      <h1 className="text-7xl text-center font-bold mb-6 drop-shadow">
        ♣️ Poker
      </h1>

      <p className="text-center mb-4 text-3xl">
        Fase: <span className="font-bold text-green-300">{pokerPhase}</span>
      </p>

      {roundSummary && (
        <div className="animate-fade-in mb-6">
          <RoundResult summary={roundSummary?.summary ?? []} />
        </div>
      )}

      {isMyTurn && !opponentLeft && (
        <div className="w-full flex justify-center mb-4">
          <CountdownBar countdown={countdown} total={total} />
        </div>
      )}

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
            gameType="poker"
          />
        )}
      </div>

      {/* Mano del jugador */}
      {me && (
        <div className="flex justify-center mb-10">
          <PlayerPokerCard
            player={{
              id: me.id,
              nickname: me.nickname,
              hand: hand.map((card) => ({
                suit: card.suit as Suit,
                rank: card.rank as CardRank,
                value: card.value,
                gameType: "Poker" as const,
              })),
              coins: me.coins,
              state:
                me.state === "Playing" ||
                  me.state === "Fold" ||
                  me.state === "AllIn"
                  ? me.state
                  : undefined,
              role:
                me.role === "dealer" || me.role === "sb" || me.role === "bb"
                  ? me.role
                  : undefined,
              currentBet: me.currentBet ?? 0,
              totalBet: me.totalBet ?? 0,
            }}
          />
        </div>
      )}

      {isMyTurn && !opponentLeft && (
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
        <GamePlayerCardList
          players={otherPlayersWithAvatar.map((p) => ({
            id: p.id,
            nickName: p.nickname,
            hand: p.hand?.length
              ? p.hand.map((card) => ({
                suit: card.suit as Suit,
                rank: card.rank as CardRank,
                value: card.value,
                gameType: "Poker" as const,
              }))
              : [
                {
                  rank: "X" as CardRank,
                  suit: "X" as Suit,
                  value: 0,
                  gameType: "Poker" as const,
                },
                {
                  rank: "X" as CardRank,
                  suit: "X" as Suit,
                  value: 0,
                  gameType: "Poker" as const,
                },
              ],

            bets: [],
            isTurn: p.id === currentTurnUserId,
            coins: p.coins,
            currentBet: p.currentBet,
            totalBet: p.totalBet,
            role:
              p.role === "dealer" || p.role === "sb" || p.role === "bb"
                ? p.role
                : undefined,
          }))}
          gameType="Poker"
          revealedHands={roundSummary?.revealedHands}
        />
      </div>
    </div>
  );
};
