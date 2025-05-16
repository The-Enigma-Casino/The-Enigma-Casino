import { sample } from "effector";
import toast from "react-hot-toast";
import {
  friendRequestReceived,
  friendRequestAccepted,
  friendRemoved,
  sendFriendRequest,
  acceptFriendRequest,
  removeFriend,
  getOnlineFriendsRequested,
} from "./friends.events";
import { messageSent } from "../../../websocket/store/wsIndex";

sample({
  clock: getOnlineFriendsRequested,
  fn: () =>
    JSON.stringify({
      type: "friend",
      action: "getOnlineFriends",
    }),
  target: messageSent,
});

sample({
  clock: sendFriendRequest,
  fn: ({ receiverId }) =>
    JSON.stringify({ type: "friend", action: "send", receiverId }),
  target: messageSent,
});

sample({
  clock: acceptFriendRequest,
  fn: ({ senderId }) =>
    JSON.stringify({ type: "friend", action: "accept", senderId }),
  target: messageSent,
});

sample({
  clock: removeFriend,
  fn: ({ friendId }) =>
    JSON.stringify({ type: "friend", action: "remove", friendId }),
  target: messageSent,
});

//Alertas
sample({
  source: friendRequestReceived,
  fn: ({ nickname }) => toast(`${nickname} te ha enviado una solicitud de amistad.`),
});

sample({
  source: friendRequestAccepted,
  fn: ({ nickname }) => toast.success(`${nickname} aceptó tu solicitud de amistad.`),
});

sample({
  source: friendRemoved,
  fn: ({ removedBy }) => toast("Se ha eliminado la amistad."),
});



