import { createStore, createEvent } from "effector";
import { confirmEmailFx, loginFx, registerFx } from "../actions/authActions";
import {
  deleteLocalStorage,
  deleteSessionStorage,
  getVarLS,
  getVarSessionStorage,
  updateLocalStorage,
  updateSessionStorage,
} from "../../../utils/storageUtils";

const storedToken: string =
  getVarLS("token") || getVarSessionStorage("token") || "";

export const $token = createStore<string>(storedToken);
export const setToken = createEvent<{ token: string; rememberMe: boolean }>();
export const clearToken = createEvent();

export const setAuthError = createEvent<string>();

export const $authError = createStore<{ message: string; time: number } | null>(null)
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
