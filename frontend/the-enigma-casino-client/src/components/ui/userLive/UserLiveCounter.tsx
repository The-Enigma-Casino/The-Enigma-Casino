import { useUnit } from "effector-react";
import { $onlineUsers } from "../../../websocket/store/wsIndex";

interface Props {
  size?: "sm" | "md";
}

const UserLiveCounter = ({ size = "md" }: Props) => {
  const userLive = useUnit($onlineUsers);

  const textSize = size === "sm" ? "text-[1.4rem]" : "text-[1.8rem]";
  const iconSize = size === "sm" ? "w-10 h-10" : "w-13 h-13";

  return (
    <div className={`flex items-end gap-[2px] text-white ${textSize}`}>
      <img src="/svg/user-live.svg" alt="Usuarios conectados" className={iconSize} />
      <div>{userLive}</div>
    </div>
  );
};

export default UserLiveCounter;
