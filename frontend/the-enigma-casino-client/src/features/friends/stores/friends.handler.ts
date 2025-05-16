import { socketMessageReceived } from "../../../websocket/store/wsEvents";
import {
  friendRequestReceived,
  friendRequestAccepted,
  friendRemoved,
  onlineFriendsUpdated,
  setOnlineFriends,
} from "./friends.events";


socketMessageReceived.watch((data) => {
  if (data.type !== "friend") return;

  console.log("[WS][Friends]", data);

  switch (data.action) {
    case "friendRequestReceived":
      friendRequestReceived({
        senderId: data.senderId,
        nickname: data.nickname,
        image: data.image,
      });
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

    default:
      console.warn("[WS][Friends] Acción desconocida:", data.action);
  }
});


// onlineFriendsUpdated.watch(({ friends }) => {
//   setOnlineFriends(friends.map(f => f.id));

//   friends.forEach(f => {
//     updateFriendOnlineStatus({ id: f.id, isOnline: true });
//   });
// });
