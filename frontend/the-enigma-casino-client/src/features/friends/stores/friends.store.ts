import { createStore } from "effector";
import { Friend, FriendRequest, SearchUser } from "./friends.types";
import { removeReceivedRequest, resetCanSendMap, resetReceivedRequests, resetSearchResults, setFriends, setOnlineFriends, setReceivedRequests, setSearchResults, updateFriendOnlineStatus } from "./friends.events";
import { acceptFriendRequestFx, cancelFriendRequestFx, fetchFriendsFx, fetchReceivedRequestsFx, searchUserFx } from "./friends.effects";




export const $friends = createStore<Friend[]>([])
  .on(fetchFriendsFx.doneData, (_, list) => list)
  .on(updateFriendOnlineStatus, (state, { id, isOnline }) =>
    state.map(friend => (friend.id === id ? { ...friend, isOnline } : friend))
  );

  export const $onlineFriendsIds = createStore<number[]>([])
  .on(setOnlineFriends, (_, list) => list);

  // Borrar¿
// export const $canSendMap = createStore<Record<number, boolean>>({})
//   .on(canSendFriendRequestFx.done, (state, { params, result }) => ({
//     ...state,
//     [params.receiverId]: result,
//   }));

export const $searchResults = createStore<Friend[]>([])
  .on(searchUserFx.doneData, (_, users) => {
    console.log("[DEBUG] Store actualizada con:", users);
    return users;
  })
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

searchUserFx.doneData.watch((data) => {
  setSearchResults(data);
});