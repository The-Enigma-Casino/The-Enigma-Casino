import { IMAGE_PROFILE_URL } from "../../../config";

interface FriendItemProps {
  id: number;
  nickname: string;
  image: string;
  isFriend: boolean;
  isOnline?: boolean;
  status?: "Online" | "Playing";
  mode: "friend-list" | "search";
  canSend?: boolean;
  onInviteClick?: (gameType: string) => void;
  onAddFriendClick?: () => void;
  onProfileClick?: () => void;
  onClose?: () => void;
  onAcceptRequestClick?: () => void;
  onRejectRequestClick?: () => void;
  onRemoveFriendClick?: () => void;
}

const gameLabels: Record<string, string> = {
  BlackJack: "BlackJack",
  Poker: "Poker",
  Roulette: "Ruleta",
};

export const FriendItem: React.FC<FriendItemProps> = ({
  nickname,
  image,
  isFriend,
  status = "Online",
  mode,
  canSend,
  onInviteClick,
  onAddFriendClick,
  onProfileClick,
  onAcceptRequestClick,
  onRejectRequestClick,
  onRemoveFriendClick,
}) => {
  const isPlayingStatus = status === "Playing";
  const isOnlineStatus = status === "Online";
  return (
    <div className="friend-item flex w-full gap-4">

      {/* Izquierda */}
      <div className="flex items-center gap-3 w-1/2 ml-10">

        <img
          src={`${IMAGE_PROFILE_URL}${image}`}
          className="w-16 h-16 rounded-full object-cover"
        />
        <p className="text-white text-2xl">{nickname}</p>
      </div>

      {/* Derecha */}
      <div className="flex flex-col gap-2 w-1/2">
        {/* Estado */}
        {mode === "friend-list" ? (
          <>
            <div className="flex items-center gap-1 text-lg">
              <span
                className={`w-2.5 h-2.5 rounded-full ${isPlayingStatus ? "bg-yellow-400" : isOnlineStatus ? "bg-Principal" : "bg-red-500"
                  }`}
              ></span>
              <span className="text-gray-400 font-light text-base self-start">
                {isPlayingStatus ? "EN PARTIDA" : isOnlineStatus ? "EN LÍNEA" : "DESCONECTADO"}
              </span>
            </div>
          </>
        ) : (
          <span className="invisible">Estado</span>
        )}

        {/* Iconos */}
        <div className="flex gap-2 ml-10">
          {(mode === "friend-list" || mode === "search") && (
            <button onClick={onProfileClick} title="Ver perfil">
              <img src="/svg/friendProfile.svg" className="w-8 h-8" />
            </button>
          )}

          {mode === "friend-list" && isFriend && isOnlineStatus && (
            <div className="relative">
              <details className="group" open={false}>
                <summary
                  title="Invitar a jugar"
                  className={`list-none focus:outline-none ${isPlayingStatus ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                    }`}
                  onClick={(e) => {
                    if (isPlayingStatus) e.preventDefault();
                  }}
                >
                  <img
                    src="/svg/invite_friend_table.svg"
                    className="w-8 h-8"
                    alt="Invitar"
                  />
                </summary>
                {!isPlayingStatus && (
                  <ul className="absolute z-10 top-6 right-0 bg-gray-800 border border-gray-600 text-white rounded shadow-lg text-sm min-w-[120px]">
                    {["BlackJack", "Poker", "Roulette"].map((game) => (
                      <li
                        key={game}
                        className="px-3 py-1 hover:bg-gray-700 cursor-pointer"
                        onClick={() => onInviteClick?.(game)}
                      >
                        {gameLabels[game]}
                      </li>
                    ))}
                  </ul>
                )}
              </details>
            </div>
          )}

          {mode === "friend-list" && isFriend && (
            <button onClick={onRemoveFriendClick} title="Eliminar amigo">
              <img src="/svg/reject-friend.svg" className="w-8 h-8" />
            </button>
          )}

          {mode === "search" && onAddFriendClick && canSend && (
            <button onClick={onAddFriendClick} title="Enviar solicitud">
              <img src="/svg/add-friend.svg" className="w-8 h-8" />
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
                    <img src="/svg/accept.svg" className="w-8 h-8" />
                  </button>
                )}
                {onRejectRequestClick && (
                  <button
                    onClick={onRejectRequestClick}
                    title="Rechazar solicitud"
                  >
                    <img src="/svg/delete.svg" className="w-8 h-8" />
                  </button>
                )}
              </>
            )}
        </div>
      </div>
    </div>
  );
};
