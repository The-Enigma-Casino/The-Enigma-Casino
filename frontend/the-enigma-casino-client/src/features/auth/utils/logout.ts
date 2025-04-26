import { useNavigate } from "react-router-dom";
import { clearToken } from "../store/authStore";
import { clearStorage } from "../../../utils/storageUtils";
import { resetCoins } from "../../coins/store/coinsStore";

export function useLogout() {
  const navigate = useNavigate();

  return () => {
    clearToken();
    clearStorage();
    resetCoins();
    navigate("/");
  };
}