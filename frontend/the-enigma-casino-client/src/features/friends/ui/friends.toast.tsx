import toast from "react-hot-toast";
import { FriendToast } from "./FriendToast";
import { acceptFriendRequest, acceptGameInvite, acceptTableInvite, newFriendRequestsDetected, rejectFriendRequest, rejectGameInvite } from "../stores/friends.events";
import { acceptFriendRequestFx, cancelFriendRequestFx } from "../stores";
import { IMAGE_PROFILE_URL } from "../../../config";

// export function showFriendRequestToast(data: {
//   senderId: number;
//   nickname: string;
//   image: string;
// }) {
//   toast.custom((t) => (
//     <FriendToast
//       id={t.id}
//       image={data.image}
//       nickname={data.nickname}
//       message="te ha enviado una solicitud de amistad"
//       onAccept={() => acceptFriendRequest({ senderId: data.senderId })}
//       onReject={() => rejectFriendRequest({ senderId: data.senderId })}
//     />
//   ));
// }



export function showGameInviteToast(data: {
  inviterId: number;
  nickname: string;
  image: string;
  tableId: number;
  expiresIn: number;
  mode?: "table" | "friendsList";
}) {
  let gameTypeMessage = "una partida";

  if (data.tableId >= 1 && data.tableId <= 6) {
    gameTypeMessage = "una mesa de Blackjack 🃏";
  } else if (data.tableId >= 7 && data.tableId <= 13) {
    gameTypeMessage = "una mesa de Poker ♠️";
  } else if (data.tableId >= 14) {
    gameTypeMessage = "una mesa de Ruleta 🎰";
  }

  const onAccept =
    data.mode === "table"
      ? () => acceptTableInvite({ inviterId: data.inviterId, tableId: data.tableId })
      : () => acceptGameInvite({ inviterId: data.inviterId, tableId: data.tableId });

  toast.custom(
    (t) => (
      <FriendToast
        id={t.id}
        image={`${IMAGE_PROFILE_URL}${data.image}`}
        nickname={data.nickname}
        message={`te ha invitado a ${gameTypeMessage}`}
        onAccept={onAccept}
        onReject={() => rejectGameInvite({ inviterId: data.inviterId })}
      />
    ),
    { duration: data.expiresIn * 1000 }
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
        onAccept={() => acceptFriendRequest({ senderId: req.senderId })}
        onReject={() => rejectFriendRequest({ senderId: req.senderId })}
      />
    ));
  });
});
