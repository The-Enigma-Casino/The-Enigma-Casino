import { createStore, createEvent, sample } from "effector";
import { loginFx, registerFx } from "../actions/authActions";
import {
  deleteLocalStorage,
  deleteSessionStorage,
  getVarLS,
  getVarSessionStorage,
  updateLocalStorage,
  updateSessionStorage,
} from "../../../utils/storageUtils";

import { jwtDecode } from "jwt-decode";
import { DecodedToken } from "../models/DecodedToken .interface";

const storedToken: string =
  getVarLS("token") || getVarSessionStorage("token") || "";

export const $token = createStore<string>(storedToken);
export const setToken = createEvent<{ token: string; rememberMe: boolean }>();
export const clearToken = createEvent();

export const $role = createStore<string>("");
export const setRole = createEvent<string>();
export const loadRole = createEvent();

export const $name = createStore<string>("");
export const setName = createEvent<string>();
export const loadName = createEvent();

export const $image = createStore<string>("user_default.png");
export const setImage = createEvent<string>();
export const loadImage = createEvent();

export const $userId = createStore<string>("");
export const loadUserId = createEvent();

export const setAuthError = createEvent<string>();

export const $authError = createStore<{ message: string; time: number } | null>(
  null
)
  .on(setAuthError, (_, error) => ({ message: error, time: Date.now() }))
  .on(loginFx.failData, (_, error) => ({ message: error, time: Date.now() }))
  .on(registerFx.failData, (_, error) => ({ message: error, time: Date.now() }))
  .reset(clearToken);

$token
  .on(setToken, (_, { token }) => token)
  .on(clearToken, () => "")
  .on(loginFx.doneData, (_, token) => token);

setToken.watch(({ token, rememberMe }) => {
  if (token) {
    loadUserId();
    loadRole();
    loadName();
    loadImage();
    if (rememberMe) {
      updateLocalStorage("token", token);
    } else {
      updateSessionStorage("token", token);
    }
  } else {
    deleteLocalStorage("token");
    deleteSessionStorage("token");
  }
});

sample({
  clock: loadRole,
  source: $token,
  fn: (token) => {
    try {
      const decoded: DecodedToken = jwtDecode(token);
      return decoded?.role || "";
    } catch {
      return "";
    }
  },
  target: $role,
});

sample({
  clock: loadName,
  source: $token,
  fn: (token) => {
    try {
      const decoded: DecodedToken = jwtDecode(token);
      console.log("name: ", decoded?.name);
      return decoded?.name || "";
    } catch {
      return "";
    }
  },
  target: $name,
});

sample({
  clock: loadUserId,
  source: $token,
  fn: (token): string => {
    try {
      const decoded: DecodedToken = jwtDecode(token);
      return String(decoded?.id) || "";
    } catch {
      return "";
    }
  },
  target: $userId,
});

sample({
  clock: loadImage,
  source: $token,
  fn: (token) => {
    try {
      const decoded: DecodedToken = jwtDecode(token);
      return decoded?.image || "user_default.png";
    } catch {
      return "user_default.png";
    }
  },
  target: $image,
});
