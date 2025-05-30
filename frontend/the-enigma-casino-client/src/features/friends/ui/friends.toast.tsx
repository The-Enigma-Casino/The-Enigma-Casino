import toast from "react-hot-toast";
import { FriendToast } from "./FriendToast";
import { acceptFriendRequest, acceptGameInvite, acceptTableInvite, newFriendRequestsDetected, rejectFriendRequest, rejectGameInvite, removeSimpleAlert, startGameLoading } from "../stores/friends.events";
import { IMAGE_PROFILE_URL } from "../../../config";

const gameTypeMap: Record<number, { label: string; img: string }> = {
  0: { label: "BlackJack", img: "/img/ficha-blackjack.webp" },
  1: { label: "Póker", img: "/img/ficha-poker.webp" },
  2: { label: "Ruleta", img: "/img/ficha-roulette.webp" },
};

function getGameTypeByTableId(tableId: number) {
  if (tableId >= 1 && tableId <= 6) return gameTypeMap[0];
  if (tableId >= 7 && tableId <= 12) return gameTypeMap[1];
  if (tableId >= 13 && tableId <= 18) return gameTypeMap[2];
  return null;
}

export function showGameInviteToast(data: {
  inviterId: number;
  nickname: string;
  image: string;
  tableId: number;
  expiresIn: number;
  mode?: "table" | "friendsList";
}): string {
  const gameType = getGameTypeByTableId(data.tableId);
  const alertId = `game_invite-${data.inviterId}-${data.tableId}`;

  const onAccept = () => {
    if (data.mode === "table") {
      acceptTableInvite({ inviterId: data.inviterId, tableId: data.tableId });
      startGameLoading();
    } else {

      acceptGameInvite({ inviterId: data.inviterId, tableId: data.tableId });
      startGameLoading();
    }
  };



  const toastId = toast.custom((t) => (
    <FriendToast
      id={t.id}
      image={`${IMAGE_PROFILE_URL}${data.image}`}
      nickname={data.nickname}
      message={
        <span className="flex flex-wrap items-center text-xl gap-2">
          te ha invitado a
          {gameType ? (
            <span className="flex items-center gap-2">
              <span className="font-semibold">{gameType.label}</span>
              <img
                src={gameType.img}
                alt={gameType.label}
                className="w-8 h-8 object-contain"
              />
            </span>
          ) : (
            <span>una partida</span>
          )}
        </span>
      }
      onAccept={() => {
        onAccept();
        removeSimpleAlert(alertId);
      }}
      onReject={() => {
        rejectGameInvite({ inviterId: data.inviterId });
        removeSimpleAlert(alertId);
      }}
    />
  ),
    {
      duration: 19000,
    }
  );
  return toastId;
}

newFriendRequestsDetected.watch((newRequests) => {
  newRequests.forEach((req) => {
    toast.custom((t) => (
      <FriendToast
        id={t.id}
        image={`${IMAGE_PROFILE_URL}${req.image}`}
        nickname={req.nickname}
        message="te ha enviado una solicitud de amistad"
        onAccept={() => {
          acceptFriendRequest({ senderId: req.meta.senderId });
          removeSimpleAlert(req.id)
        }}
        onReject={() => {
          rejectFriendRequest({ senderId: req.meta.senderId });
          removeSimpleAlert(req.id)
        }}
      />
    ),
      {
        duration: 4000,
      });
  });
});
