import { useEffect } from "react";
import { useUnit } from "effector-react";
import { $playerAvatars } from "../../../stores/gamesStore";
import {
  $countryCache,
  requestCountry,
} from "../../../../countries/stores/countriesStore";
import { IMAGE_PROFILE_URL } from "../../../../../config";
import { CardStack } from "../GameCardStack";
import { RoleChip } from "../../../pocker/components/RoleChip";
import { GameCard } from "../../interfaces/gameCard.interface";
import { CardRank, GameType, Suit } from "../../types/gameCard.type";
import classes from "./GameCardPlayerList.module.css"

type GamePlayer = {
  id: number;
  nickName: string;
  hand: GameCard[];
  total?: number;
  bets?: { bet: string; amount: number }[];
  isTurn?: boolean;
  coins: number;
  currentBet?: number;
  totalBet?: number;
  role?: "dealer" | "sb" | "bb";
};

type Props = {
  players: GamePlayer[];
  gameType: "Blackjack" | "Poker";
  revealedHands?: {
    userId: number;
    cards: { rank: number; suit: number }[];
  }[];
};

export const GamePlayerCardList = ({
  players,
  gameType,
  revealedHands,
}: Props) => {
  const avatars = useUnit($playerAvatars);
  const countryCache = useUnit($countryCache);

  const getAvatar = (nickName: string) => {
    return avatars.find((a) => a.nickName === nickName);
  };

  const suitMap: Suit[] = ["Hearts", "Diamonds", "Clubs", "Spades"];
  const rankMap: CardRank[] = [
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Jack",
    "Queen",
    "King",
    "Ace",
  ];

  useEffect(() => {
    avatars.forEach((avatar) => {
      const code = avatar.country?.toUpperCase();
      if (code && !countryCache[code]) {
        requestCountry(code);
      }
    });
  }, [avatars, countryCache]);

  if (players.length === 0) return null;


  const cardCountMax = Math.max(...players.map(p => p.hand.length), 0);
  const containerWidth =
    cardCountMax <= 2
      ? "w-full sm:w-[260px]"
      : cardCountMax <= 4
        ? "w-full sm:w-[340px]"
        : cardCountMax <= 6
          ? "w-full sm:w-[360px]"
          : "w-full sm:w-[380px]";

  const getScale = (count: number) => {
    if (count <= 2) return 1;
    if (count <= 3) return 0.9;
    if (count === 4) return 0.8;
    if (count === 5) return 0.7;
    if (count === 6) return 0.58;
    return 0.68;
  };


  return (
    <div className={`bg-gray/30 rounded-xl p-3 flex flex-col gap-6 ${containerWidth} max-w-[95vw] sm:max-w-none`}>
      <h2 className="text-3xl font-bold text-white mb-4 text-center shadow-xl-white">
        Jugadores en la partida
      </h2>

      <div className={`grid grid-cols-1 gap-y-6 overflow-y-auto max-h-[80vh] p-1 ${classes.customScroll}`}>
        {players.map((player) => {
          const avatar = getAvatar(player.nickName);
          if (!avatar) return null;

          const country = avatar.country
            ? countryCache[avatar.country]
            : undefined;
          const flagUrl = country?.flags?.png;

          let visibleCards: GameCard[];

          if (gameType === "Poker") {
            const revealed = revealedHands?.find((h) => h.userId === player.id);

            if (revealed) {
              visibleCards = revealed.cards.map((card) => ({
                suit: suitMap[card.suit],
                rank: rankMap[card.rank - 2],
                value: 0,
                gameType: "Poker",
              }));
            } else {
              visibleCards = player.hand.slice(0, 2).map((card) => ({
                suit: card.suit as Suit,
                rank: card.rank as CardRank,
                value: card.value,
                gameType: "Poker" as GameType,
              }));
            }
          } else {
            visibleCards = player.hand.map((card) => ({
              suit: card.suit as Suit,
              rank: card.rank as CardRank,
              value: card.value,
              gameType: gameType as GameType,
            }));
          }

          const total = typeof player.total === "number" ? player.total : "-";

          return (
            <div
              key={player.id}
              className={`relative bg-black/30 p-4 rounded-xl text-white shadow-md transition-shadow flex flex-col gap-3 ${player.isTurn ? "animate-pulseGlow" : ""
                }`}
            >
              {/* Header: avatar + nombre + bandera */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <img
                    src={`${IMAGE_PROFILE_URL}${avatar.image}`}
                    alt={player.nickName}
                    className="w-16 h-16 rounded-full border border-white object-cover"
                  />
                  <div className="flex items-center gap-2">
                    <p className="text-white font-semibold text-lg sm:text-xl md:text-2xl">
                      {player.nickName}
                    </p>
                    {player.role && <RoleChip role={player.role} />}
                  </div>
                </div>

                {flagUrl && (
                  <img
                    src={flagUrl}
                    alt={`Bandera de ${country?.name.common}`}
                    className="w-10 h-8 rounded shadow"
                    style={{ marginRight: "4px", marginTop: "4px" }}
                  />
                )}
              </div>

              {/* Apuestas */}
              <div className="flex flex-col gap-1 text-xl sm:text-xl md:text-2xl">
                {gameType === "Poker" ? (
                  <>
                    <p className="text-white/80">
                      Fichas disponibles:{" "}
                      <span className="font-semibold text-Coins">
                        {player.coins}
                      </span>
                    </p>
                    {player.currentBet !== undefined && (
                      <p className=" text-white/80">
                        Apuesta actual:{" "}
                        <span className="font-semibold text-Coins">
                          {player.currentBet}
                        </span>
                      </p>
                    )}
                    {player.totalBet !== undefined && (
                      <p className=" text-white/80">
                        Total apostado:{" "}
                        <span className="font-semibold text-Coins">
                          {player.totalBet}
                        </span>
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <div className="flex gap-2 items-baseline">
                      <p className="font-bold text-white">Apuesta:</p>
                      {player.coins === 0 || !player.bets?.length ? (
                        <p className=" text-Coins">
                          Sin apuestas activas
                        </p>
                      ) : (
                        <p className="text-Coins">
                          {player.bets[0].amount}
                        </p>
                      )}
                    </div>

                    {player.currentBet !== undefined && (
                      <p className="text-white/80">
                        Apuesta actual:{" "}
                        <span className="font-semibold text-Coins">
                          {player.currentBet}
                        </span>
                      </p>
                    )}

                    {player.totalBet !== undefined && (
                      <p className=" text-white/80">
                        Total apostado:{" "}
                        <span className="font-semibold text-Coins">
                          {player.totalBet}
                        </span>
                      </p>
                    )}
                  </>
                )}
              </div>

              <div className="flex justify-center w-full overflow-hidden">
                <div
                  className="transition-transform origin-center inline-flex"
                  style={{
                    transform: `scale(${getScale(visibleCards.length)})`,
                  }}
                >
                  <CardStack
                    cards={visibleCards}
                    hideAll={
                      gameType === "Poker" &&
                      !revealedHands?.some((h) => h.userId === player.id)
                    }
                    gameType="poker"
                  />
                </div>
              </div>



              {/* Total */}
              {
                gameType === "Blackjack" && (
                  <p className="text-2xl font-bold text-Coins text-center">
                    Total: {total}
                  </p>
                )
              }

              {/* Turno */}
              {
                player.isTurn && (
                  <p
                    className={`text-xl font-semibold text-center h-6 ${player.isTurn ? "text-Principal" : "text-transparent"
                      }`}
                  >
                    Turno de {player.nickName}
                  </p>
                )
              }
            </div>
          );
        })}
      </div>
    </div >
  );
};
