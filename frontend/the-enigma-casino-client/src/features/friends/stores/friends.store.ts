import { combine, createStore } from "effector";
import { Friend, FriendRequest, SearchUser, SimpleAlert } from "./friends.types";
import {
  addSimpleAlert,
  bellNewAlert,
  bellNotification,
  bellReset,
  bulkAddSimpleAlerts,
  clearAllSimpleAlerts,
  fetchReceivedRequests,
  onlineFriendsUpdated,
  removeReceivedRequest,
  removeSimpleAlert,
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
import { tableCleanupCompleted } from "../../gameTables/store/tablesIndex";



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


export const $onlineFriendsStatusMap = createStore<Map<number, string>>(
  new Map()
).on(onlineFriendsUpdated, (_, { friends }) => {
  const map = new Map(
    (friends as Array<{ id: number; status?: string }>).map((f) => [
      Number(f.id),
      f.status || "Online",
    ])
  );
  return map;
});

export const $friends = combine(
  $rawFriends,
  $onlineFriendsStatusMap,
  (friends, statusMap) => {
    return friends.map((friend) => ({
      ...friend,
      isOnline: statusMap.has(Number(friend.id)),
      status: statusMap.get(Number(friend.id)) || "Offline"
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
  .on(stopGameLoading, () => false)
  .reset([tableCleanupCompleted]);


export type BellType = "none" | "new" | "notification";
export const $bellType = createStore<BellType>("none")
  .on(bellReset, () => "none")
  .on(bellNewAlert, () => "new")
  .on(bellNotification, () => "notification");

export const $simpleAlerts = createStore<SimpleAlert[]>([])
  .on(addSimpleAlert, (state, alert) => {
    const exists = state.some((a) => a.id === alert.id);
    return exists ? state : [alert, ...state];
  })
  .on(removeSimpleAlert, (state, id) => state.filter((a) => a.id !== id))
  .on(bulkAddSimpleAlerts, (state, alerts) => {
    const existingIds = new Set(state.map((a) => a.id));
    const newAlerts = alerts.filter((a) => !existingIds.has(a.id));
    return [...newAlerts, ...state];
  })
  .on(clearAllSimpleAlerts, () => []);

export const $isInitialFetch = createStore(true)
  .on(fetchReceivedRequests, (_, { isInitial }) => isInitial);

