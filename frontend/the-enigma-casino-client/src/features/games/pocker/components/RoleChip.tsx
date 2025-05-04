// RoleChip.tsx
import { FC } from "react";

interface Props {
  role: "dealer" | "sb" | "bb";
}

export const RoleChip: FC<Props> = ({ role }) => {
  const style = {
    dealer: "bg-yellow-400 text-black",
    sb: "bg-blue-500 text-white",
    bb: "bg-red-500 text-white",
  }[role];

  const label = {
    dealer: "D",
    sb: "SB",
    bb: "BB",
  }[role];

  return (
    <div className={`w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center shadow ${style}`}>
      {label}
    </div>
  );
};