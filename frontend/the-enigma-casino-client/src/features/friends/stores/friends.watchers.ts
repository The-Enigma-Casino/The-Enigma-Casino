import { friendRemoved, friendRequestAccepted, friendRequestReceived, getOnlineFriendsRequested, requestAccepted, sendFriendRequest, setSearchResults } from "./friends.events";
import {
  acceptFriendRequestFx,
  cancelFriendRequestFx,
  fetchFriendsFx,
  fetchReceivedRequestsFx,
  searchUserFx,
  sendFriendRequestFx,
} from "./friends.effects";

// Al aceptar, actualiza amigos y solicitudes
acceptFriendRequestFx.done.watch(() => {
  fetchReceivedRequestsFx();
  fetchFriendsFx().finally(() => {
    getOnlineFriendsRequested();
  });
});

friendRequestReceived.watch(() => {
  fetchReceivedRequestsFx();
});

// Cuando otro usuario acepta nuestra solicitud
friendRequestAccepted.watch(() => {
  fetchFriendsFx().finally(() => getOnlineFriendsRequested());
});

requestAccepted.watch(() => {
  fetchFriendsFx().finally(() => {
    getOnlineFriendsRequested();
  });
});

// Al cancelar solicitud
cancelFriendRequestFx.done.watch(() => {
  fetchReceivedRequestsFx();
  fetchFriendsFx();
});

friendRemoved.watch(() => {
  fetchFriendsFx().finally(() => {
    getOnlineFriendsRequested();
  });
});

// Actualiza resultados de busqueda
searchUserFx.doneData.watch(setSearchResults);
