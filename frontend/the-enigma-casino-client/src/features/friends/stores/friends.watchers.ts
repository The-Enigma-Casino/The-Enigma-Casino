import { friendRequestAccepted, friendRequestReceived, getOnlineFriendsRequested, sendFriendRequest, setSearchResults } from "./friends.events";
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
friendRequestAccepted.watch((payload) => {
  console.log("[WATCHER] friendRequestAccepted recibido:", payload);
  fetchFriendsFx().finally(() => getOnlineFriendsRequested());
});

// Al cancelar solicitud
cancelFriendRequestFx.done.watch(() => {
  fetchReceivedRequestsFx();
  fetchFriendsFx();
});


// Actualiza resultados de búsqueda
searchUserFx.doneData.watch(setSearchResults);
sendFriendRequestFx.watch(({ receiverId }) => {
  console.log(`[FRIEND] Enviando solicitud por HTTP a usuario ${receiverId} (no amigo o desconectado)`);
});
sendFriendRequest.watch(({ receiverId }) => {
  console.log("[DEBUG] Evento sendFriendRequest lanzado con ID:", receiverId);
});
