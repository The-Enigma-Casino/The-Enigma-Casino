import { fetchReceivedRequests, friendRemoved, friendRequestAccepted, getOnlineFriendsRequested, requestAccepted, setSearchResults, userSessionInitialized } from "./friends.events";
import {
  acceptFriendRequestFx,
  cancelFriendRequestFx,
  fetchFriendsFx,
  fetchReceivedRequestsFx,
  searchUserFx,
} from "./friends.effects";

// Al aceptar, actualiza amigos y solicitudes
acceptFriendRequestFx.done.watch(() => {
  fetchReceivedRequestsFx();
  fetchFriendsFx().finally(() => {
    getOnlineFriendsRequested();
  });
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

userSessionInitialized.watch(() => {
  fetchReceivedRequests({ isInitial: true });
});
