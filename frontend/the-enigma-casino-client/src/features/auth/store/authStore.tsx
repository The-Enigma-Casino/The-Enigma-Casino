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

export const $authError = createStore<string | null>(null)
  .on(loginFx.failData, (_, error) => error)
  .on(registerFx.failData, (_, error) => error)
  .on(confirmEmailFx.failData, (_, error) => error)
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
