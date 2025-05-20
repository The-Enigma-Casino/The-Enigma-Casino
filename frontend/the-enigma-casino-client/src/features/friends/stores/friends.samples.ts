import { sample } from "effector";
import toast from "react-hot-toast";
import {
  friendRequestAccepted,
  friendRemoved,
  acceptFriendRequest,
  removeFriend,
  getOnlineFriendsRequested,
  rejectFriendRequest,
  acceptGameInvite,
  rejectGameInvite,
  acceptTableInvite,
  inviteFriendFromTable,
  newFriendRequestsDetected,
  sendFriendRequestWs,
  inviteFriendFromList,
} from "./friends.events";
import { messageSent } from "../../../websocket/store/wsIndex";
import { $lastRequestIds, $onlineFriendsMap } from "./friends.store";
import { acceptFriendRequestFx, cancelFriendRequestFx, fetchReceivedRequestsFx, removeFriendFx, sendFriendRequestFx } from "./friends.effects";

sample({
  clock: getOnlineFriendsRequested,
  fn: () =>
    JSON.stringify({
      type: "friend",
      action: "getOnlineFriends",
    }),
  target: messageSent,
});

// Add friend ONLINE y OFFLINE
sample({
  clock: sendFriendRequestWs,
  fn: ({ receiverId }) => JSON.stringify({
    type: "friend",
    action: "send",
    receiverId,
  }),
  target: messageSent,
});

sample({
  clock: sendFriendRequestWs,
  fn: ({ receiverId }) => ({ receiverId }),
  target: sendFriendRequestFx,
});


// Accept friend ONLINE - WS
sample({
  clock: acceptFriendRequest,
  source: $onlineFriendsMap,
  filter: (onlineMap, { senderId }) => onlineMap.has(senderId),
  fn: (_, { senderId }) => JSON.stringify({
    type: "friend",
    action: "accept",
    senderId,
  }),
  target: messageSent,
});

// Accept friend OFFLINE - API
sample({
  clock: acceptFriendRequest,
  source: $onlineFriendsMap,
  filter: (onlineMap, { senderId }) => !onlineMap.has(senderId),
  fn: (_, { senderId }) => ({ senderId }),
  target: acceptFriendRequestFx,
});

// Reject friend OFFLINE - WS
sample({
  clock: rejectFriendRequest,
  source: $onlineFriendsMap,
  filter: (onlineMap, { senderId }) => onlineMap.has(senderId),
  fn: (_, { senderId }) => JSON.stringify({
    type: "friend",
    action: "cancel",
    receiverId: senderId,
  }),
  target: messageSent,
});

// Reject friend OFFLINE - API
sample({
  clock: rejectFriendRequest,
  source: $onlineFriendsMap,
  filter: (onlineMap, { senderId }) => !onlineMap.has(senderId),
  fn: (_, { senderId }) => ({ senderId }),
  target: cancelFriendRequestFx,
});

// Remove friend ONLINE - WS
sample({
  clock: removeFriend,
  fn: ({ friendId }) => JSON.stringify({
    type: "friend",
    action: "remove",
    friendId,
  }),
  target: messageSent,
});

sample({
  clock: removeFriend,
  fn: ({ friendId }) => ({ friendId }),
  target: removeFriendFx,
});



//Alertas
sample({
  source: friendRequestAccepted,
  fn: ({ nickname }) => toast.success(`${nickname} aceptó tu solicitud de amistad.`),
});

// Aceptar juego
sample({
  clock: acceptGameInvite,
  fn: ({ inviterId, tableId }) =>
    JSON.stringify({
      type: "friend",
      action: "acceptGameInvite",
      inviterId,
      tableId,
    }),
  target: messageSent,
});

// Rechazar juego
sample({
  clock: rejectGameInvite,
  fn: ({ inviterId }) =>
    JSON.stringify({
      type: "friend",
      action: "rejectGameInvite",
      inviterId,
    }),
  target: messageSent,
});

sample({
  clock: acceptTableInvite,
  fn: ({ inviterId, tableId }) =>
    JSON.stringify({
      type: "friend",
      action: "acceptTableInvite",
      inviterId,
      tableId,
    }),
  target: messageSent,
});

sample({
  clock: inviteFriendFromTable,
  fn: ({ friendId, tableId }) =>
    JSON.stringify({
      type: "friend",
      action: "inviteFromTable",
      friendId,
      tableId,
    }),
  target: messageSent,
});

sample({
  clock: inviteFriendFromList,
  fn: ({ friendId, gameType }) =>
    JSON.stringify({
      type: "friend",
      action: "inviteFromFriendsList",
      friendId,
      gameType,
    }),
  target: messageSent,
});



sample({
  clock: fetchReceivedRequestsFx.doneData,
  source: $lastRequestIds,
  fn: (previousIds, newRequests) =>
    newRequests.filter((req) => !previousIds.includes(req.id)),
  target: newFriendRequestsDetected,
});

sample({
  clock: fetchReceivedRequestsFx.doneData,
  fn: (reqs) => reqs.map((r) => r.id),
  target: $lastRequestIds,
});
