import { getVarLS, getVarSessionStorage } from "../../../utils/storageUtils";
import {
  loadImage,
  loadName,
  loadRole,
  loadUserId,
  setToken,
} from "../store/authStore";

export function initAuth() {
  const token = getVarLS("token") || getVarSessionStorage("token");

  if (token) {
    setToken({ token: String(token), rememberMe: Boolean(getVarLS("token")) });
    loadUserId();
    loadRole();
    loadName();
    loadImage();
  }
}
