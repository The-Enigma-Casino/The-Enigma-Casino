import { useEffect } from "react";
import { useUnit } from "effector-react";
import { $playerAvatars } from "../../stores/gamesStore";
import {
  $countryCache,
  requestCountry,
} from "../../../countries/stores/countriesStore";
import { IMAGE_PROFILE_URL } from "../../../../config";
import { CardStack } from "../../shared/components/GameCardStack";
import { ActionButton } from "../../shared/components/buttonActions/ActionButton";
import { loadCoins } from "../../../coins/stores/coinsStore";
import { GameCard } from "../../shared/interfaces/gameCard.interface";
import { CardRank, GameType, Suit } from "../../shared/types/gameCard.type";
import { $localPlayerRoundResult } from "../store/bjIndex";

type GamePlayer = {
  id: number;
  nickName: string;
  hand: GameCard[];
  total?: number;
  bets: { bet: string; amount: number }[];
  isTurn?: boolean;
  coins: number;
  state?:
    | "Playing"
    | "Bust"
    | "Stand"
    | "Lose"
    | "Win"
    | "Draw"
    | "Waiting"
    | "Blackjack";
};

type Props = {
  player: GamePlayer;
  gameType: "Blackjack" | "Poker";
  gameState: string;
  onHit: () => void;
  onStand: () => void;
  onDouble: () => void;
};

export const LocalPlayerCard = ({
  player,
  gameType,
  gameState,
  onHit,
  onStand,
  onDouble,
}: Props) => {
  const avatars = useUnit($playerAvatars);
  const countryCache = useUnit($countryCache);
  const result = useUnit($localPlayerRoundResult);

  const avatar = avatars.find((a) => a.nickName === player.nickName);
  const countryCode = avatar?.country?.toUpperCase();
  const country = countryCode ? countryCache[countryCode] : undefined;

  const rankToValue = (rank: string): number => {
    if (["J", "Q", "K"].includes(rank)) return 10;
    if (rank === "A") return 11;
    return parseInt(rank, 10) || 0;
  };

  useEffect(() => {
    if (countryCode && !countryCache[countryCode]) {
      requestCountry(countryCode);
    }
  }, [countryCode, countryCache]);

  useEffect(() => {
    loadCoins();
  }, []);

  if (!avatar) return null;

  const flagUrl = country?.flags?.png;

  const visibleCards: GameCard[] = (
    gameType === "Poker" ? player.hand.slice(0, 2) : player.hand
  ).map((card) => ({
    suit: card.suit as Suit,
    rank: card.rank as CardRank,
    value: rankToValue(card.rank),
    gameType: gameType as GameType,
  }));

  const total = typeof player.total === "number" ? player.total : "-";

  const cardCount = visibleCards.length;

  const containerWidth =
    cardCount <= 2
      ? "w-full max-w-[320px] md:max-w-[360px] lg:max-w-[400px]"
      : cardCount <= 4
      ? "w-full max-w-[360px] md:max-w-[400px] lg:max-w-[440px]"
      : cardCount <= 6
      ? "w-full max-w-[380px] md:max-w-[420px] lg:max-w-[460px]"
      : "w-full max-w-[400px] md:max-w-[440px] lg:max-w-[480px]";

  return (
    <div
      className={`bg-black/40 rounded-xl p-4 flex flex-col transition-all duration-300 ease-in-out ${containerWidth}`}
    >
      <div
        className={`relative  p-4 rounded-xl text-white shadow-md transition-shadow flex flex-col gap-3
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
            <p className="text-white font-semibold text-2xl">
              {player.nickName}
            </p>
          </div>

          {flagUrl && (
            <img
              src={flagUrl}
              alt={`Bandera de ${country?.name.common}`}
              className="w-10 h-8 rounded shadow"
            />
          )}
        </div>

        {/* Apuestas */}
        <div className="flex gap-2">
          <p className="text-xl font-bold text-white">Apuesta:</p>
          {player.coins === 0 ? (
            <p className="text-xl text-Coins">Sin apuestas activas</p>
          ) : (
            <p className="text-xl text-Coins">{player.coins}</p>
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
                    ? 1
                    : visibleCards.length <= 4
                    ? 0.95
                    : visibleCards.length === 5
                    ? 0.8
                    : visibleCards.length === 6
                    ? 0.68
                    : 0.68
                })`,
              }}
            >
              <CardStack cards={visibleCards} gameType="blackjack" />
            </div>
          </div>
        </div>

        {/* Total */}
        {gameType === "Blackjack" && (
          <p className="text-2xl font-bold text-Coins text-center">
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

        {/* Botones de acción */}
        {player.isTurn &&
          gameState === "InProgress" &&
          player.state === "Playing" && (
            <div className="flex gap-2 mt-2 justify-center">
              <ActionButton label="HIT" onClick={onHit} color="green" />
              <ActionButton label="STAND" onClick={onStand} color="yellow" />
              <ActionButton label="DOUBLE" onClick={onDouble} color="purple" />
            </div>
          )}

        {gameState === "InProgress" && player.state !== "Playing" && (
          <p
            className={`text-2xl mt-2 text-center transition-all duration-300 ease-in-out ${
              player.state === "Win" || player.state === "Blackjack"
                ? "text-Coins animate-pulse"
                : "text-white/70"
            }`}
          >
            {player.state === "Bust" && "💥 Te pasaste de 21!"}
            {player.state === "Stand" && "🧍 Te plantaste. Esperando..."}
            {player.state === "Draw" && "🤝 Empate"}
            {player.state === "Lose" && "❌ Has perdido esta ronda."}
            {(player.state === "Win" || player.state === "Blackjack") &&
              `🏆 ¡Victoria! ${
                result?.coinsChange ? `+${result.coinsChange} fichas` : ""
              }`}
          </p>
        )}
      </div>
    </div>
  );
};
