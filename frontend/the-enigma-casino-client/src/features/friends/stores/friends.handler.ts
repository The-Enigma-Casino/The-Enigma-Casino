import { socketMessageReceived } from "../../../websocket/store/wsEvents";
import {
  friendRequestReceived,
  friendRequestAccepted,
  friendRemoved,
  onlineFriendsUpdated,
  removeReceivedRequest,
  requestAccepted,
  stopGameLoading,
  bellNewAlert,
  bellReset,
} from "./friends.events";
import {
  showGameInviteToast,
} from "../ui/friends.toast";
import toast from "react-hot-toast";
import { joinTableClicked } from "../../gameTables/store/tablesEvents";
import { navigateTo } from "../../games/shared/router/navigateFx";
import { $currentTableId } from "../../gameTables/store/tablesStores";

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
      bellNewAlert();
      break;

    case "friendRequestAccepted":
      friendRequestAccepted({
        friendId: data.friendId,
        nickname: data.nickname,
        image: data.image,
      });
      bellNewAlert();
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
      bellNewAlert();
      break;

    case "gameInviteAccepted": {
      const tableId = Number(data.tableId);

      toast.success(
        `¡${data.nickName} ha aceptado tu invitación a la mesa ${tableId}!`,
        { duration: 2000 }
      );

      const alreadyInTable = $currentTableId.getState() === tableId;

      if (!alreadyInTable) {
        const gameViewPath = (() => {
          if (tableId >= 1 && tableId <= 6) return "/tables/0";
          if (tableId >= 7 && tableId <= 12) return "/tables/1";
          if (tableId >= 13 && tableId <= 18) return "/tables/2";
          return "/tables";
        })();

        navigateTo(gameViewPath);
        setTimeout(() => {
          joinTableClicked(tableId);
        }, 300);
      }

      bellNewAlert();
      setTimeout(() => bellReset(), 2000);
      break;
    }

    case "gameInviteRejected":
      stopGameLoading();
      toast.error(`${data.nickname} rechazó tu invitación.`, { duration: 2000 });
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
      bellNewAlert();
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
