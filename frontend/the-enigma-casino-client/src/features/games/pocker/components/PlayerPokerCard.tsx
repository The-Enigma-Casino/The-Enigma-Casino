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
    <div className="bg-black/30 rounded-xl p-4 w-[300px] flex flex-col gap-3 text-white shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <p className="text-2xl font-bold">{player.nickname}</p>
          {player.role && <RoleChip role={player.role} />}
        </div>
        {player.isTurn && (
          <span className="text-green-300 font-semibold text-sm">
            Tu turno
          </span>
        )}
      </div>

      {/* Apuestas */}
      <div className="text-sm space-y-1">
        <p>Fichas: <span className="font-semibold">{player.coins}</span></p>
        <p>Apuesta actual: <span className="text-yellow-300">{player.currentBet}</span></p>
        <p>Total apostado: <span className="text-yellow-300">{player.totalBet}</span></p>
      </div>

      {/* Cartas */}
      <div>
      <CardStack cards={player.hand ?? []} />
      </div>

      {/* Estado */}
      {player.state === "Fold" && (
        <p className="text-red-400 font-semibold text-center">Te has retirado</p>
      )}
      {player.state === "AllIn" && (
        <p className="text-yellow-300 font-semibold text-center">All-In</p>
      )}
    </div>
  );
};

