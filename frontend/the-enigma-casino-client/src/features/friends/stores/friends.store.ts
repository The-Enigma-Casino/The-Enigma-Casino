import { createStore } from "effector";
import { Friend, FriendRequest } from "./friends.types";
import { setFriends, setOnlineFriends, setReceivedRequests, updateFriendOnlineStatus } from "./friends.events";
import { canSendFriendRequestFx, fetchFriendsFx, fetchReceivedRequestsFx } from "./friends.effects";




const $friends = createStore<Friend[]>([])
  .on(fetchFriendsFx.doneData, (_, list) => list)
  .on(updateFriendOnlineStatus, (state, { id, isOnline }) =>
    state.map(friend => (friend.id === id ? { ...friend, isOnline } : friend))
  );

const $onlineFriendsIds = createStore<number[]>([])
  .on(setOnlineFriends, (_, list) => list);

const $receivedRequests = createStore<FriendRequest[]>([])
  .on(fetchReceivedRequestsFx.doneData, (_, list) => list);

export const $canSendRequest = createStore<boolean | null>(null)
  .on(canSendFriendRequestFx.doneData, (_, result) => result)
  .reset(canSendFriendRequestFx.pending);
