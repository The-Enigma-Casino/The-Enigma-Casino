import { useUnit } from "effector-react";
import { $bellType } from "../stores/friends.store";



export const Bell = () => {
  const bellType = useUnit($bellType);

  let icon = "/svg/bell.svg";
  if (bellType === "new") icon = "/svg/bell-ringing.svg";
  if (bellType === "notification") icon = "/svg/notification-bell.svg";

  return <img src={icon} alt="Notificaciones" className="w-18 h-18" />;
};
