import { IMAGE_PROFILE_URL } from "../../../config";

interface FriendItemProps {
  id: number;
  nickname: string;
  image: string;
  isFriend: boolean;
  isOnline?: boolean;
  mode: "friend-list" | "search";
  canSend?: boolean;
  onInviteClick?: () => void;
  onAddFriendClick?: () => void;
  onProfileClick?: () => void;
  onAcceptRequestClick?: () => void;
  onRejectRequestClick?: () => void;
  onRemoveFriendClick?: () => void;
}

export const FriendItem: React.FC<FriendItemProps> = ({
  id,
  nickname,
  image,
  isFriend,
  isOnline,
  mode,
  canSend,
  onInviteClick,
  onAddFriendClick,
  onProfileClick,
  onAcceptRequestClick,
  onRejectRequestClick,
  onRemoveFriendClick,
}) => {
console.log("FriendItem", { id, isOnline });
  return (
    <div className="friend-item flex items-start justify-between gap-3 py-2 border-b border-gray-600">
      {/* Izquierda: imagen y nombre */}
      <div className="flex">
        <div className="flex items-center gap-3">
          <img
            src={`${IMAGE_PROFILE_URL}${image}`}
            className="w-10 h-10 rounded-full object-cover"
          />
          <p className="text-white text-lg">{nickname}</p>
        </div>
      </div>

      {/* Derecha: estado y acciones */}
      <div className="flex flex-col items-end">
        {/* Estado */}
        {(mode === "friend-list" || mode === "search") && (
          <div className="flex items-center gap-1 text-sm">
            <span
              className={`w-2 h-2 rounded-full ${
                isOnline ? "bg-green-400" : "bg-red-500"
              }`}
            ></span>
            <span className={isOnline ? "text-green-400" : "text-red-500"}>
              {isOnline ? "EN LÍNEA" : "DESCONECTADO"}
            </span>
          </div>
        )}

        {/* Iconos principales */}
        <div className="flex justify-center gap-3 mt-2">
          {(mode === "friend-list" || mode === "search") && (
            <button onClick={onProfileClick} title="Ver perfil">
              <img src="/svg/friendProfile.svg" className="w-5 h-5" />
            </button>
          )}

          {mode === "friend-list" && isOnline && (
            <button onClick={onInviteClick} title="Invitar a partida">
              <img src="/svg/addFriend.svg" className="w-5 h-5" />
            </button>
          )}

          {mode === "friend-list" && isFriend && (
            <button onClick={onRemoveFriendClick} title="Eliminar amigo">
              <img src="/svg/reject-friend.svg" className="w-5 h-5" />
            </button>
          )}

          {mode === "search" && onAddFriendClick && canSend && (
            <button onClick={onAddFriendClick} title="Enviar solicitud">
              <img src="/svg/add-friend.svg" className="w-5 h-5" />
            </button>
          )}

          {mode === "search" &&
            (onAcceptRequestClick || onRejectRequestClick) && (
              <>
                {onAcceptRequestClick && (
                  <button
                    onClick={onAcceptRequestClick}
                    title="Aceptar solicitud"
                  >
                    <img src="/svg/accept.svg" className="w-5 h-5" />
                  </button>
                )}
                {onRejectRequestClick && (
                  <button
                    onClick={onRejectRequestClick}
                    title="Rechazar solicitud"
                  >
                    <img src="/svg/delete.svg" className="w-5 h-5" />
                  </button>
                )}
              </>
            )}
        </div>
      </div>
    </div>
  );
};
