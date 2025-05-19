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

type GamePlayer = {
  id: number;
  nickName: string;
  hand: Card[];
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

  useEffect(() => {
    avatars.forEach((avatar) => {
      const code = avatar.country?.toUpperCase();
      if (code && !countryCache[code]) {
        requestCountry(code);
      }
    });
  }, [avatars, countryCache]);

  if (players.length === 0) return null;

  return (
    <div className="bg-black/40 rounded-xl p-4 w-[300px] flex flex-col gap-12">
      <h2 className="text-3xl font-bold text-white mb-4 text-center shadow-xl-white">
        Jugadores en la partida
      </h2>

      <div className="grid grid-cols-1 gap-y-6">
        {players.map((player) => {
          const avatar = getAvatar(player.nickName);
          if (!avatar) return null;

          const country = avatar.country
            ? countryCache[avatar.country]
            : undefined;
          const flagUrl = country?.flags?.png;

          let visibleCards;

          if (gameType === "Poker") {
            const revealed = revealedHands?.find((h) => h.userId === player.id);

            if (revealed) {
              const suitNames = [
                "spades",
                "hearts",
                "clubs",
                "diamonds",
              ] as const;
              const rankNames = [
                "two",
                "three",
                "four",
                "five",
                "six",
                "seven",
                "eight",
                "nine",
                "ten",
                "jack",
                "queen",
                "king",
                "ace",
              ] as const;

              visibleCards = revealed.cards.map((card) => ({
                suit: suitNames[card.suit],
                rank: rankNames[card.rank - 2],
                value: 0,
                gameType: "Poker",
              }));
            } else {
              visibleCards = player.hand.slice(0, 2).map((card) => ({
                ...card,
                gameType: "Poker",
              }));
            }
          } else {
            visibleCards = player.hand.map((card) => ({
              ...card,
              gameType,
            }));
          }

          const total = typeof player.total === "number" ? player.total : "-";

          return (
            <div
              key={player.id}
              className={`relative bg-black/30 p-4 rounded-xl text-white shadow-md transition-shadow flex flex-col gap-3 ${
                player.isTurn ? "animate-pulseGlow" : ""
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
                    <p className="text-white font-semibold text-2xl">
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
              <div className="flex flex-col gap-1">
                {gameType === "Poker" ? (
                  <>
                    <p className="text-sm text-white/80">
                      Fichas disponibles:{" "}
                      <span className="font-semibold text-Coins">
                        {player.coins}
                      </span>
                    </p>
                    {player.currentBet !== undefined && (
                      <p className="text-sm text-white/80">
                        Apuesta actual:{" "}
                        <span className="font-semibold text-yellow-300">
                          {player.currentBet}
                        </span>
                      </p>
                    )}
                    {player.totalBet !== undefined && (
                      <p className="text-sm text-white/80">
                        Total apostado:{" "}
                        <span className="font-semibold text-yellow-300">
                          {player.totalBet}
                        </span>
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <div className="flex gap-2 items-baseline">
                      <p className="text-xl font-bold text-white">Apuesta:</p>
                      {player.coins === 0 || !player.bets?.length ? (
                        <p className="text-xl text-Coins">
                          Sin apuestas activas
                        </p>
                      ) : (
                        <p className="text-xl text-Coins">
                          {player.bets[0].amount}
                        </p>
                      )}
                    </div>

                    {player.currentBet !== undefined && (
                      <p className="text-sm text-white/80">
                        Apuesta actual:{" "}
                        <span className="font-semibold text-yellow-300">
                          {player.currentBet}
                        </span>
                      </p>
                    )}

                    {player.totalBet !== undefined && (
                      <p className="text-sm text-white/80">
                        Total apostado:{" "}
                        <span className="font-semibold text-yellow-300">
                          {player.totalBet}
                        </span>
                      </p>
                    )}
                  </>
                )}
              </div>

              {/* Cartas */}
              <div className="overflow-hidden">
                <div className="flex justify-center w-full">
                  <div
                    className="transition-transform origin-center inline-flex"
                    style={{
                      transform: `scale(${
                        visibleCards.length <= 2
                          ? 1.0
                          : visibleCards.length <= 4
                          ? 1
                          : visibleCards.length === 5
                          ? 0.8
                          : 0.7
                      })`,
                    }}
                  >
                    <CardStack
                      cards={visibleCards}
                      hideAll={
                        gameType === "Poker" &&
                        !revealedHands?.some((h) => h.userId === player.id)
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Total */}
              {gameType === "Blackjack" && (
                <p className="text-2xl font-bold text-yellow-300 text-center">
                  Total: {total}
                </p>
              )}

              {/* Turno */}
              {player.isTurn && (
                <p
                  className={`text-xl font-semibold text-center h-6 ${
                    player.isTurn ? "text-Principal" : "text-transparent"
                  }`}
                >
                  Turno de {player.nickName}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
