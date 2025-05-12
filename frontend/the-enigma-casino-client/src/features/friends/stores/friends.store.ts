import { createStore } from "effector";
import { Friend, FriendRequest } from "./friends.types";
import { removeReceivedRequest, resetReceivedRequests, resetSearchResults, setFriends, setOnlineFriends, setReceivedRequests, updateFriendOnlineStatus } from "./friends.events";
import { acceptFriendRequestFx, cancelFriendRequestFx, canSendFriendRequestFx, fetchFriendsFx, fetchReceivedRequestsFx, searchUserFx } from "./friends.effects";




export const $friends = createStore<Friend[]>([])
  .on(fetchFriendsFx.doneData, (_, list) => list)
  .on(updateFriendOnlineStatus, (state, { id, isOnline }) =>
    state.map(friend => (friend.id === id ? { ...friend, isOnline } : friend))
  );

  export const $onlineFriendsIds = createStore<number[]>([])
  .on(setOnlineFriends, (_, list) => list);

  export const $canSendMap = createStore<Record<number, boolean>>({})
  .on(canSendFriendRequestFx.done, (state, { params, result }) => ({
    ...state,
    [params.receiverId]: result,
  }));

  // TO DO - Crear endpoint busqueda usuarios - No borrar
  export const $searchResults = createStore<Friend[]>([])
  .on(searchUserFx.doneData, (_, users) => users)
  .reset(resetSearchResults);

export const $receivedRequests = createStore<FriendRequest[]>([])
  .on(fetchReceivedRequestsFx.doneData, (_, list) => list)
  .on(removeReceivedRequest, (state, senderId) =>
    state.filter(req => req.senderId !== senderId)
  )
  .reset(resetReceivedRequests);


  // Actualiza al aceptar o rechazar
  acceptFriendRequestFx.done.watch(() => {
  fetchReceivedRequestsFx();
  fetchFriendsFx();
});

cancelFriendRequestFx.done.watch(() => {
  fetchReceivedRequestsFx();
  fetchFriendsFx();
});

