import { createEffect } from "effector";
import axios from "axios";
import { getAuthHeaders } from "../../auth/utils/authHeaders";
import {
  GET_FRIENDS,
  GET_RECEIVED_REQUESTS,
  SEND_REQUEST,
  ACCEPT_REQUEST,
  CANCEL_REQUEST,
  REMOVE_FRIEND,
  IS_FRIEND,
  SEARCH_USERS
} from "../../../config";

import { Friend, FriendRequest } from "./friends.types";

/* ---- ENDPOINTS ----*/

// Obtener todos los amigos del usuario
export const fetchFriendsFx = createEffect(async (): Promise<Friend[]> => {
  const response = await axios.get(GET_FRIENDS, {
    headers: getAuthHeaders(),
  });
  return response.data;
});

// Obtener solicitudes de amistad recibidas
export const fetchReceivedRequestsFx = createEffect(async (): Promise<FriendRequest[]> => {
  const response = await axios.get(GET_RECEIVED_REQUESTS, {
    headers: getAuthHeaders(),
  });
  return response.data;
});

// Enviar solicitud de amistad
export const sendFriendRequestFx = createEffect(
  async ({ receiverId }: { receiverId: number }): Promise<void> => {
    await axios.post(`${SEND_REQUEST}?receiverId=${receiverId}`, null, {
      headers: getAuthHeaders(),
    });
  }
);

// Aceptar solicitud de amistad
export const acceptFriendRequestFx = createEffect(
  async ({ senderId }: { senderId: number }): Promise<void> => {
    await axios.post(`${ACCEPT_REQUEST}?senderId=${senderId}`, null, {
      headers: getAuthHeaders(),
    });
  }
);

// Cancelar solicitud de amistad
export const cancelFriendRequestFx = createEffect(
  async ({ senderId }: { senderId: number }): Promise<void> => {
    await axios.delete(`${CANCEL_REQUEST}?senderId=${senderId}`, {
      headers: getAuthHeaders(),
    });
  }
);

// Eliminar amigo
export const removeFriendFx = createEffect(
  async ({ friendId }: { friendId: number }): Promise<void> => {
    await axios.delete(`${REMOVE_FRIEND}?friendId=${friendId}`, {
      headers: getAuthHeaders(),
    });
  }
);

// Comprobar si son amigos
export const isFriendFx = createEffect(
  async ({ otherUserId }: { otherUserId: number }): Promise<boolean> => {
    const response = await axios.get(`${IS_FRIEND}?otherUserId=${otherUserId}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  }
);

// Buscar usuarios
export const searchUserFx = createEffect(async (query: string) => {
  const response = await axios.get(`${SEARCH_USERS}?query=${query}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
});



