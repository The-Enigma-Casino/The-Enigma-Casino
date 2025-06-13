import { clearToken } from "../store/authStore";
import { clearStorage } from "../../../utils/storageUtils";
import { resetCoins } from "../../coins/stores/coinsStore";

export function useLogout() {

  return () => {
    clearToken();
    clearStorage();
    resetCoins();
    clearStorage();
    window.location.href = "/auth/login";
  };
}


export function logoutUser() {
  clearToken();
  resetCoins();
  clearStorage();
}
