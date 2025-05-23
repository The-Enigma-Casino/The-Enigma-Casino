import { combine, createStore } from "effector";
import { Friend, FriendRequest, SearchUser } from "./friends.types";
import {
  bellNewAlert,
  bellNotification,
  bellReset,
  onlineFriendsUpdated,
  removeReceivedRequest,
  removeUserFromSearchResults,
  resetReceivedRequests,
  resetSearchResults,
  setSearchResults,
  startGameLoading,
  stopGameLoading,
} from "./friends.events";
import {
  fetchFriendsFx,
  fetchReceivedRequestsFx,
} from "./friends.effects";

export const $onlineFriendsMap = createStore<Map<number, boolean>>(
  new Map()
).on(onlineFriendsUpdated, (_, { friends }) => {
  const ids = friends.map((f) => f.id);

  const map = new Map(ids.map((id) => [Number(id), true]));
  return map;
});

export const $rawFriends = createStore<Friend[]>([]).on(
  fetchFriendsFx.doneData,
  (_, friends) => friends
);

export const $friends = combine(
  $rawFriends,
  $onlineFriendsMap,
  (friends, onlineMap) => {
    return friends.map((friend) => ({
      ...friend,
      isOnline: onlineMap.has(Number(friend.id)),
    }));
  }
);

export const $searchResults = createStore<SearchUser[]>([])
  .on(setSearchResults, (_, users) => users)
  .on(resetSearchResults, () => [])
  .on(removeUserFromSearchResults, (state, userId) =>
    state.filter((u) => u.id !== userId)
  );

export const $receivedRequests = createStore<FriendRequest[]>([])
  .on(fetchReceivedRequestsFx.doneData, (_, list) => list)
  .on(removeReceivedRequest, (state, senderId) =>
    state.filter((req) => req.senderId !== senderId)
  )
  .reset(resetReceivedRequests);

export const $lastRequestIds = createStore<number[]>([]);


export const $isGameLoading = createStore(false)
  .on(startGameLoading, () => true)
  .on(stopGameLoading, () => false);


export type BellType = "none" | "new" | "notification";
export const $bellType = createStore<BellType>("none")
  .on(bellReset, () => "none")
  .on(bellNewAlert, () => "new")
  .on(bellNotification, () => "notification");
