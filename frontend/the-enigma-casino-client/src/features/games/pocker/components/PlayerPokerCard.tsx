import { CardStack } from "../../shared/components/GameCardStack";
import { GameCard } from "../../shared/interfaces/gameCard.interface";
import { RoleChip } from "./RoleChip";

type PlayerPoker = {
  id: number;
  nickname: string;
  hand: GameCard[];
  coins: number;
  currentBet?: number;
  totalBet?: number;
  role?: "dealer" | "sb" | "bb";
  state?: "Playing" | "Fold" | "AllIn";
  isTurn?: boolean;
};

type Props = {
  player: PlayerPoker;
};

export const PlayerPokerCard = ({ player }: Props) => {
  return (
    <div className="bg-black/30 rounded-xl p-5 w-[300px] flex flex-col gap-4 text-white shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <p className="text-2xl font-bold">{player.nickname}</p>
          {player.role && <RoleChip role={player.role} />}
        </div>
        {player.isTurn && (
          <span className="text-Principal font-semibold text-base">
            Tu turno
          </span>
        )}
      </div>

      {/* Apuestas */}
      <div className="text-xl sm:text-xl md:text-2xl space-y-2 leading-tight">
        <p>
          Fichas: <span className="font-bold text-Coins">{player.coins}</span>
        </p>
        <p>
          Apuesta actual: <span className="font-bold text-Coins">{player.currentBet}</span>
        </p>
        <p>
          Total apostado: <span className="font-bold text-Coins">{player.totalBet}</span>
        </p>
      </div>

      {/* Cartas */}
      <div>
        <CardStack cards={player.hand ?? []} gameType="poker" />
      </div>

      {/* Estado */}
      {player.state === "Fold" && (
        <p className="text-Color-Cancel text-lg font-semibold text-center">
          Te has retirado
        </p>
      )}
      {player.state === "AllIn" && (
        <p className="text-Coins text-lg font-semibold text-center">All-In</p>
      )}
    </div>
  );
};
