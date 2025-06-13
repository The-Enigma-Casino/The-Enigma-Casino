import { sample } from "effector";
import { $token } from "../../auth/store/authStore";
import { loadCoins } from "./coinsStore";
import { getCoinsByUserFx } from "../actions/coinsActions";


sample({
  source: $token,
  clock: loadCoins,
  filter: (token) => !!token,
  target: getCoinsByUserFx,
});
