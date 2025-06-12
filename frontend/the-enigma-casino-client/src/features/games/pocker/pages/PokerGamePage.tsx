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
import { PlayerPokerCard } from "../components/PlayerPokerCard";
import { $playerAvatars } from "../../stores/gamesStore";
import { getPlayerAvatarsFx } from "../../actions/playerAvatarsAction";
import { RoundResult } from "../components/RoundResult";
import { ResponsivePlayerList } from "../../shared/components/playerCards/ResponsivePlayerList";
import { GamePlayer } from "../interfaces/poker.interfaces";

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

  const formattedPlayers: GamePlayer[] = otherPlayersWithAvatar.map((p) => ({
    id: p.id,
    nickName: p.nickname ?? "Jugador desconocido",
    hand: p.hand?.length
      ? p.hand.map((card) => ({
        suit: card.suit as Suit,
        rank: card.rank as CardRank,
        value: card.value,
        gameType: "Poker" as const,
      }))
      : [
        { rank: "X" as CardRank, suit: "X" as Suit, value: 0, gameType: "Poker" },
        { rank: "X" as CardRank, suit: "X" as Suit, value: 0, gameType: "Poker" },
      ],
    bets: [],
    isTurn: p.id === currentTurnUserId,
    coins: p.coins,
    currentBet: p.currentBet,
    totalBet: p.totalBet,
    role: ["dealer", "sb", "bb"].includes(p.role ?? "") ? (p.role as "dealer" | "sb" | "bb") : undefined,
  }));
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

  return (
    <div className="min-h-screen bg-green-900 bg-repeat p-6 text-white w-full overflow-x-hidden">

      <div className="max-w-full-2xl mx-auto flex flex-row gap-6 items-start">

        {/* Columna central: contenido principal */}
        <div className="flex-1 flex flex-col items-center w-full max-w-full overflow-hidden">

          <h1 className="text-5xl sm:text-5xl md:text-6xl lg:text-7xl text-center font-bold mt-2 mb-6 drop-shadow">
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
            <CountdownBar countdown={countdown} total={total} />
          )}

          {/* Cartas comunitarias */}
          <div className="flex justify-center items-center flex-col gap-4 mb-8">
            {communityCards.length === 0 && !roundSummary ? (
              (
                <p className="text-2xl text-white/80">
                  Sin cartas comunitarias todavía.
                </p>
              )
            ) : (
              <div
                className="transition-transform origin-center inline-flex"
                style={{
                  transform: `scale(${communityCards.length <= 2
                    ? 1
                    : communityCards.length <= 4
                      ? 0.95
                      : communityCards.length === 5
                        ? 0.8
                        : 0.8
                    })`,
                }}
              >
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
              </div>
            )}
          </div>
          {roundSummary && (
            <div className="mb-6 text-2xl sm:text-2xl md:text-3xl text-Coins font-bold animate-pulse text-center max-w-xs sm:max-w-md mx-auto px-2">
              🃏 Barajando cartas para la próxima ronda...
            </div>
          )}
          {/* Mano del jugador local */}
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
                  isTurn: me.id === currentTurnUserId,
                }}
              />
            </div>
          )}

          {/* Controles de acción para turno local */}
          {isMyTurn && !opponentLeft && (
            <ActionControls
              validMoves={validMoves}
              callAmount={callAmount}
              maxRaise={maxRaise}
              onAction={handleAction}
            />
          )}

        </div>

        {/* Lista de otros jugadores */}
        {formattedPlayers.length > 0 && (
          <ResponsivePlayerList
            players={formattedPlayers}
            gameType="Poker"
            revealedHands={roundSummary?.revealedHands}
          />
        )}

      </div>
    </div>
  );
};
