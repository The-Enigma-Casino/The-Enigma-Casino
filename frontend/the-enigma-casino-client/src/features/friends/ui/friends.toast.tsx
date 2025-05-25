import toast from "react-hot-toast";
import { FriendToast } from "./FriendToast";
import { acceptFriendRequest, acceptGameInvite, acceptTableInvite, bellReset, newFriendRequestsDetected, rejectFriendRequest, rejectGameInvite, startGameLoading } from "../stores/friends.events";
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
}) {
  const gameType = getGameTypeByTableId(data.tableId);

  const onAccept = () => {
    if (data.mode === "table") {
      acceptTableInvite({ inviterId: data.inviterId, tableId: data.tableId });
      startGameLoading();
    } else {

      acceptGameInvite({ inviterId: data.inviterId, tableId: data.tableId });
      startGameLoading();
    }
  };



  toast.custom((t) => (
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
        bellReset();
      }}
      onReject={() => {
        rejectGameInvite({ inviterId: data.inviterId });
        bellReset();
      }}
    />
  ),
    {
      duration: 20000,
    }
  );
}

newFriendRequestsDetected.watch((newRequests) => {
  newRequests.forEach((req) => {
    toast.custom((t) => (
      <FriendToast
        id={t.id}
        image={`${IMAGE_PROFILE_URL}${req.image}`}
        nickname={req.nickName}
        message="te ha enviado una solicitud de amistad"
        onAccept={() => {
          acceptFriendRequest({ senderId: req.senderId });
          bellReset();
        }}
        onReject={() => {
          rejectFriendRequest({ senderId: req.senderId });
          bellReset();
        }}
      />
    ),
      {
        duration: 4000,
      });
  });
});
