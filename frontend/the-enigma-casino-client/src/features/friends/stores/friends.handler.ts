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
  addSimpleAlert,
  bellNotification,
  newFriendRequestsDetected,
  removeSimpleAlert,
} from "./friends.events";
import {
  showGameInviteToast,
} from "../ui/friends.toast";
import toast from "react-hot-toast";
import { joinTableClicked } from "../../gameTables/store/tablesEvents";
import { navigateTo } from "../../games/shared/router/navigateFx";
import { $currentTableId } from "../../gameTables/store/tablesStores";
import { SimpleAlert } from "./friends.types";
import { $simpleAlerts } from "./friends.store";

socketMessageReceived.watch((data) => {

  if (data.type !== "friend") return;

  switch (data.action) {
    case "friendRequestReceived": {

      const alert: SimpleAlert<"friend_request"> = {
        id: `friend_request-${data.senderId}`,
        type: "friend_request",
        nickname: data.nickname,
        image: data.image,
        timestamp: Date.now(),
        meta: {
          senderId: data.senderId,
        },
      };

      friendRequestReceived({
        senderId: data.senderId,
        nickname: data.nickname,
        image: data.image,
      });

      addSimpleAlert(alert);

      newFriendRequestsDetected([alert]);
      bellNewAlert();
      setTimeout(() => {
        const currentAlerts = $simpleAlerts.getState();
        const stillExists = currentAlerts.some((a) => a.id === alert.id);

        if (stillExists) {
          bellNotification();
        } else if (currentAlerts.length === 0) {
          bellReset();
        }
      }, 5000);
      break;
    }

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

    case "friendInvitedToGame": {
      const toastId = showGameInviteToast({
        inviterId: data.inviterId,
        nickname: data.nickname,
        image: data.image,
        tableId: parseInt(data.tableId),
        expiresIn: data.expiresIn,
        mode: "table",
      });

      const alertId = `game_invite-${data.inviterId}-${data.tableId}`;
      addSimpleAlert({
        id: alertId,
        type: "game_invite",
        nickname: data.nickname,
        image: data.image,
        timestamp: Date.now(),
        meta: {
          inviterId: data.inviterId,
          tableId: data.tableId,
          mode: "table",
          toastId,
        },
      } as SimpleAlert<"game_invite">);

      bellNewAlert();
      setTimeout(() => {
        const currentAlerts = $simpleAlerts.getState();
        const stillExists = currentAlerts.some((a) => a.id === alertId);

        if (stillExists) {
          bellNotification();
        } else if (currentAlerts.length === 0) {
          bellReset();
        }
      }, 19000)
      break;
    }
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

    case "inviteExpired": {
      const alertId = `game_invite-${data.inviterId}-${data.tableId}`;
      removeSimpleAlert(alertId);
      break;
    }

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
