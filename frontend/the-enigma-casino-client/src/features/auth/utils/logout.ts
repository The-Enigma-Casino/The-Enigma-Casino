import { clearToken } from "../store/authStore";
import { clearStorage } from "../../../utils/storageUtils";
import { resetCoins } from "../../coins/store/coinsStore";

export function useLogout() {

  return () => {
    clearToken();
    clearStorage();
    resetCoins();
    clearStorage();
    window.location.href = "/";
  };
}


export function logoutUser() {
  clearToken();
  resetCoins();
  clearStorage();
}
