import { socketMessageReceived } from "../../../websocket/store/wsEvents";
import {
  friendRequestReceived,
  friendRequestAccepted,
  friendRemoved,
  onlineFriendsUpdated,
  setOnlineFriends,
  removeReceivedRequest,
} from "./friends.events";
import {
  showFriendRequestToast,
  showGameInviteToast,
} from "../ui/friends.toast";
import toast from "react-hot-toast";

socketMessageReceived.watch((data) => {
  console.log("[INIT] Friends handler registrado");
  if (data.type !== "friend") return;

  console.log("[WS][Friends]", data);

  switch (data.action) {
    case "friendRequestReceived":
      friendRequestReceived({
        senderId: data.senderId,
        nickname: data.nickname,
        image: data.image,
      });

      showFriendRequestToast(data);
      break;
    case "friendRequestAccepted":
      friendRequestAccepted({
        friendId: data.friendId,
        nickname: data.nickname,
        image: data.image,
      });
      break;

    case "friendRemoved":
      friendRemoved({ removedBy: data.removedBy });
      break;

    case "onlineFriends":
      onlineFriendsUpdated({ friends: data.friends });
      break;

    case "friendInvitedToGame":
      showGameInviteToast({
        inviterId: data.inviterId,
        nickname: data.nickname,
        image: data.image,
        tableId: parseInt(data.tableId),
        expiresIn: data.expiresIn,
        mode: "table",
      });
      break;
    case "gameInviteAccepted":
      toast.success(
        `¡${data.friendId} ha aceptado tu invitación a la mesa ${data.tableId}!`
      );
      break;

    case "gameInviteRejected":
      toast.error(`El usuario ${data.friendId} rechazó tu invitación.`);
      break;

    case "inviteExpired":
      toast(
        `La invitación con ${data.friendId || data.inviterId} ha expirado.`
      );
      break;

    case "friendRequestCanceled":
      removeReceivedRequest(data.senderId); // Quitar del store
      toast(`${data.senderId} canceló su solicitud de amistad.`);
      break;

    case "requestSent":
      toast.success("Solicitud enviada correctamente.");
      break;

    case "requestAccepted":
      toast("Has aceptado la solicitud.");
      break;

    case "requestCanceled":
      toast("Cancelaste la solicitud.");
      break;
    default:
      console.warn("[WS][Friends] Acción desconocida:", data.action);
  }
});
