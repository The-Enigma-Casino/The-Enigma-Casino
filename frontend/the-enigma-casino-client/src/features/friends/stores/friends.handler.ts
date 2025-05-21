import { socketMessageReceived } from "../../../websocket/store/wsEvents";
import {
  friendRequestReceived,
  friendRequestAccepted,
  friendRemoved,
  onlineFriendsUpdated,
  removeReceivedRequest,
  requestAccepted,
  stopGameLoading,
} from "./friends.events";
import {
  // showFriendRequestToast,
  showGameInviteToast,
} from "../ui/friends.toast";
import toast from "react-hot-toast";
import { joinTableClicked } from "../../gameTables/store/tablesEvents";

socketMessageReceived.watch((data) => {

  if (data.type !== "friend") return;

  console.log("[WSFRIEND[ - DATA", data);

  switch (data.action) {
    case "friendRequestReceived":
      friendRequestReceived({
        senderId: data.senderId,
        nickname: data.nickname,
        image: data.image,
      });
      break;

    case "friendRequestAccepted":
      console.log("[WS] Solicitud aceptada recibida por el solicitante");
      friendRequestAccepted({
        friendId: data.friendId,
        nickname: data.nickname,
        image: data.image,
      });
      break;

    case "friendRemoved":
      console.log("[WS] Recibido friendRemovedddddddddddd:", data);
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
        , { duration: 2000 });
      joinTableClicked(Number(data.tableId)); // Table Events
      break;

    case "gameInviteRejected":
      stopGameLoading();
      toast.error(`El usuario ${data.friendId} rechazó tu invitación.`, { duration: 2000 });
      break;

    case "inviteExpired":
      //stopGameLoading();
      // toast(
      //   `La invitación con ${data.friendId || data.inviterId} ha expirado.`
      //   , { duration: 2000 });
      break;

    case "friendRequestCanceled":
      removeReceivedRequest(data.senderId); // Quitar del store
      toast(`${data.nickname} canceló su solicitud de amistad.`, { duration: 2000 });
      break;

    case "requestSent":
      toast.success("Solicitud enviada correctamente.", { duration: 2000 });
      break;

    case "requestAccepted":
      requestAccepted({ friendId: data.friendId });
      toast("Has aceptado la solicitud.", { duration: 2000 });
      break;

    case "requestCanceled":
      toast("Cancelaste la solicitud.", { duration: 2000 });
      break;

    default:
      console.warn("[WS][Friends] Acción desconocida:", data.action, { duration: 2000 });
  }
});
