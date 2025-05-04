import { FC } from "react";
import { PlayerPoker } from "../interfaces/poker.interfaces";

interface Props {
  player: PlayerPoker;
  isTurn?: boolean;
}

export const PlayerCard: FC<Props> = ({ player, isTurn }) => {
  const roleMap: Record<"dealer" | "sb" | "bb", string> = {
    dealer: "Dealer",
    sb: "SB",
    bb: "BB",
  };

  const roleLabel = player.role && roleMap[player.role as "dealer" | "sb" | "bb"];
  
  return (
    <div className="bg-black/30 p-4 rounded-xl shadow text-center border border-white/10">
      {roleLabel && (
        <div className="text-sm text-yellow-300 font-bold mb-1">
          {roleLabel}
        </div>
      )}
      <p className="text-lg font-bold">{player.nickname}</p>
      <p className="text-sm text-gray-300">{player.coins} fichas</p>
      {isTurn && (
        <p className="text-green-400 mt-1 font-semibold">🎯 Tu turno</p>
      )}
    </div>
  );
};
