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
import { DecodedToken } from "../models/DecodedToken.interface";
import { SessionCheckResult } from "../models/SessionCheckResult.type";

import { toast } from "react-hot-toast";
import { getUserImageFx } from "../../profile/store/profile/profileEffects";
import { logoutUser } from "../utils/logout";

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

export const $image = createStore<string>("user_default.webp");
export const setImage = createEvent<string>();
export const loadImage = createEvent();

export const $userId = createStore<string>("");
export const loadUserId = createEvent();

export const setAuthError = createEvent<string>();

export const verifySession = createEvent();
export const sessionChecked = createEvent<SessionCheckResult>();
export const logout = createEvent();

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
      return decoded?.image || "user_default.webp";
    } catch {
      return "user_default.webp";
    }
  },
  target: $image,
});

sample({
  clock: verifySession,
  source: $token,
  fn: (token): SessionCheckResult => {
    try {
      if (!token) return { valid: false, reason: "No token" };

      const decoded: DecodedToken = jwtDecode(token);
      const now = Date.now() / 1000;

      if (decoded.exp && decoded.exp < now) {
        return { valid: false, reason: "Token expirado" };
      }

      if (decoded.role === "Banned") {
        return { valid: false, reason: "Cuenta baneada" };
      }

      return { valid: true };
    } catch {
      return { valid: false, reason: "Token inválido" };
    }
  },
  target: sessionChecked,
});

export const logoutWithReason = createEvent<string>();

logoutWithReason.watch((reason) => {
  console.error("Sesión inválida:", reason);

  if (reason === "Cuenta baneada") {
    toast.error("Tu cuenta ha sido baneada por un administrador.");
  } else if (reason === "Auto-expulsión") {
    toast.success("Has activado la auto expulsión. 💚");
  } else if (reason === "Token expirado") {
    toast("Tu sesión ha expirado. Por favor, inicia sesión de nuevo.");
  }

  logoutUser();
});

sample({
  source: sessionChecked,
  filter: (result) => !result.valid,
  fn: (result) => result.reason ?? "Desconocido",
  target: logoutWithReason,
});

sample({
  clock: $token,
  filter: (token) => Boolean(token),
  target: getUserImageFx,
});

$token.on(logout, () => "");
$role.on(logout, () => "");
$name.on(logout, () => "");
$image.on(logout, () => "user_default.webp");
$userId.on(logout, () => "");
