import { sample } from "effector";
import toast from "react-hot-toast";
import {
  friendRequestAccepted,
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
  setSearchResults,
  bellReset,
  removeSimpleAlert,
  bulkAddSimpleAlerts,
  bellNotification,
  userSessionInitialized,
  fetchReceivedRequests,
} from "./friends.events";
import { messageSent } from "../../../websocket/store/wsIndex";
import { $isInitialFetch, $lastRequestIds, $onlineFriendsMap, $searchResults, $simpleAlerts } from "./friends.store";
import { acceptFriendRequestFx, cancelFriendRequestFx, fetchReceivedRequestsFx, removeFriendFx, sendFriendRequestFx } from "./friends.effects";
import { SimpleAlert } from "./friends.types";

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

sample({
  clock: sendFriendRequestWs,
  source: $searchResults,
  fn: (results, { receiverId }) =>
    results.filter((user) => user.id !== receiverId),
  target: setSearchResults,
});


// Accept friend ONLINE - WS
sample({
  clock: acceptFriendRequest,
  fn: ({ senderId }) =>
    JSON.stringify({
      type: "friend",
      action: "accept",
      senderId,
    }),
  target: messageSent,
});

// Accept friend OFFLINE - API
sample({
  clock: acceptFriendRequest,
  fn: ({ senderId }) => ({ senderId }),
  target: acceptFriendRequestFx,
});

// Reject friend ONLINE - WS
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
  fn: ({ nickname }) =>
    toast.success(`${nickname} aceptó tu solicitud de amistad.`, {
      id: `friend_accepted_${nickname}`,
    }),
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
  fn: (newRequests) => {
    const isInitial = $isInitialFetch.getState();
    const previousIds = $lastRequestIds.getState();

    if (isInitial) return [];

    return newRequests
      .filter((req) => !previousIds.includes(req.id))
      .map((req): SimpleAlert<"friend_request"> => ({
        id: `friend_request-${req.senderId}`,
        type: "friend_request",
        nickname: req.nickName,
        image: req.image,
        timestamp: Date.now(),
        meta: { senderId: req.senderId },
      }));
  },
  target: newFriendRequestsDetected,
});


sample({
  clock: fetchReceivedRequestsFx.doneData,
  fn: (reqs) => reqs.map((r) => r.id),
  target: $lastRequestIds,
});

sample({
  source: $simpleAlerts,
  clock: removeSimpleAlert,
  filter: (alerts) => alerts.length === 0,
  target: bellReset,
});

sample({
  clock: fetchReceivedRequestsFx.doneData,
  source: $simpleAlerts,
  fn: (existingAlerts, requests): SimpleAlert<"friend_request">[] => {
    const existingIds = new Set(existingAlerts.map((a) => a.id));

    return requests
      .map((r): SimpleAlert<"friend_request"> => ({
        id: `friend_request-${r.senderId}`,
        type: "friend_request",
        nickname: r.nickName,
        image: r.image,
        timestamp: Date.now(),
        meta: { senderId: r.senderId },
      }))
      .filter((alert) => !existingIds.has(alert.id));
  },
  target: bulkAddSimpleAlerts,
});

sample({
  clock: userSessionInitialized,
  target: fetchReceivedRequestsFx,
});

sample({
  clock: fetchReceivedRequests,
  fn: () => undefined,
  target: fetchReceivedRequestsFx,
});

sample({
  source: $simpleAlerts,
  filter: (alerts) => alerts.length > 0,
  target: bellNotification,
});

sample({
  source: $simpleAlerts,
  clock: removeSimpleAlert,
  filter: (alerts) => alerts.length === 0,
  target: bellReset,
});
